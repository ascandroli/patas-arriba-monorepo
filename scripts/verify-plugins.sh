#!/usr/bin/env bash
# Version: 2026.05.27
# Deterministic plugin-drift detector for patas-arriba-monorepo.
#
# Compares the declared state in required-plugins.yaml (source of truth)
# against the runtime state reported by `claude plugin list --json` and
# `claude plugin marketplace list --json`. Exits non-zero on actionable
# drift so it can gate CI or a SessionStart hook.
#
# Scope: marketplaces and declared plugins only. Runtime plugin loading
# (whether a plugin actually contributes skills/tools to the active session)
# is not detectable from CLI state alone — that check lives in the
# /verify-setup slash command, which inspects the live session.

set -euo pipefail

usage() {
  cat <<'EOF'
Usage: verify-plugins.sh [--json] [--quiet]

Detects plugin and marketplace drift for the current Avatia repository.

Options:
  --json      Emit a machine-readable JSON report to stdout
  --quiet     Suppress output, only set the exit code
  -h, --help  Show this help

Exit codes:
  0  no FAIL items (WARN/INFO may still be present)
  1  actionable drift detected (declared item missing or disabled)
  2  missing dependency or malformed input
EOF
}

MODE=text
QUIET=0
for arg in "$@"; do
  case "$arg" in
    --json) MODE=json ;;
    --quiet) QUIET=1 ;;
    -h|--help) usage; exit 0 ;;
    *) echo "verify-plugins.sh: unknown arg: $arg" >&2; usage >&2; exit 2 ;;
  esac
done

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SETTINGS="$REPO_ROOT/.claude/settings.json"

# Resolve installed_plugins.json. CLAUDE_CONFIG_DIR takes precedence over
# ~/.claude; relative values are resolved from REPO_ROOT (the script cd's there).
if [ -n "${CLAUDE_CONFIG_DIR:-}" ]; then
  if [[ "$CLAUDE_CONFIG_DIR" = /* ]]; then
    INSTALLED_PLUGINS_FILE="$CLAUDE_CONFIG_DIR/plugins/installed_plugins.json"
  else
    INSTALLED_PLUGINS_FILE="$REPO_ROOT/$CLAUDE_CONFIG_DIR/plugins/installed_plugins.json"
  fi
else
  INSTALLED_PLUGINS_FILE="$HOME/.claude/plugins/installed_plugins.json"
fi

err() { echo "verify-plugins.sh: $*" >&2; }
require() { command -v "$1" >/dev/null 2>&1 || { err "missing dependency: $1"; exit 2; }; }

require jq
require claude
[ -f "$SETTINGS" ] || { err "missing $SETTINGS"; exit 2; }

# `claude plugin list --json` reports project-scope plugins as enabled:false
# when invoked from outside the project. Pin cwd to REPO_ROOT so the runtime
# state matches the project we're checking, regardless of the caller's cwd.
cd "$REPO_ROOT"

RUNTIME_PLUGINS=$(claude plugin list --json 2>/dev/null) || { err "claude plugin list failed"; exit 2; }
RUNTIME_MARKETS=$(claude plugin marketplace list --json 2>/dev/null) || { err "claude plugin marketplace list failed"; exit 2; }
SETTINGS_JSON=$(cat "$SETTINGS")

# Findings accumulator: a JSON array built incrementally.
FINDINGS='[]'

push_finding() {
  # push_finding LEVEL CATEGORY TARGET MESSAGE [FIX [ACTION_KIND ACTION_ARG]]
  # ACTION_KIND is one of: install, enable, add-marketplace, none.
  # ACTION_ARG is the single shell-quoted argument the installer should pass.
  # The installer reads .action.{kind,arg} so it never needs to eval $fix.
  FINDINGS=$(jq -c \
    --arg level "$1" --arg category "$2" --arg target "$3" \
    --arg message "$4" --arg fix "${5:-}" \
    --arg action_kind "${6:-none}" --arg action_arg "${7:-}" \
    '. + [{
      level:$level, category:$category, target:$target,
      message:$message, fix:$fix,
      action: {kind:$action_kind, arg:$action_arg}
    }]' \
    <<<"$FINDINGS")
}

# ---- Declared inputs ---------------------------------------------------------
#
# Source of truth: required-plugins.yaml at the repo root (human-authored spec).
# Falls back to settings.json if the YAML does not exist (legacy environments).

REQUIRED_PLUGINS_FILE="$REPO_ROOT/required-plugins.yaml"
REQUIRED_JSON=""

if [ -f "$REQUIRED_PLUGINS_FILE" ]; then
  require python3
  REQUIRED_JSON=$(python3 - "$REQUIRED_PLUGINS_FILE" <<'PYEOF'
import re, json, sys
text = open(sys.argv[1]).read()
plugins = re.findall(r'^\s+-\s+(\S+@\S+)', text, re.MULTILINE)
markets = {}
cur = None
for line in text.splitlines():
    m = re.match(r'^  (\w[\w-]*):\s*$', line)
    if m:
        cur = m.group(1)
        markets[cur] = {}
    elif cur:
        s = re.match(r'^    source:\s+(\S+)', line)
        if s:
            markets[cur]['source'] = s.group(1)
print(json.dumps({'plugins': plugins, 'marketplaces': markets}))
PYEOF
  ) || { err "failed to parse $REQUIRED_PLUGINS_FILE"; exit 2; }
fi

declared_plugin_ids() {
  if [ -n "$REQUIRED_JSON" ]; then
    jq -r '.plugins[]' <<<"$REQUIRED_JSON"
  else
    jq -r '.enabledPlugins // {} | to_entries[] | select(.value == true) | .key' <<<"$SETTINGS_JSON"
  fi
}
declared_market_names() {
  if [ -n "$REQUIRED_JSON" ]; then
    jq -r '.marketplaces | keys[]' <<<"$REQUIRED_JSON"
  else
    jq -r '.extraKnownMarketplaces // {} | keys[]' <<<"$SETTINGS_JSON"
  fi
}
declared_market_source_for_install() {
  if [ -n "$REQUIRED_JSON" ]; then
    jq -r --arg name "$1" '.marketplaces[$name].source // ""' <<<"$REQUIRED_JSON"
  else
    jq -r --arg name "$1" '
      .extraKnownMarketplaces[$name].source
      | (.repo // .path // .url // "")
    ' <<<"$SETTINGS_JSON"
  fi
}
declared_market_kind() {
  if [ -n "$REQUIRED_JSON" ]; then
    local src
    src=$(jq -r --arg name "$1" '.marketplaces[$name].source // ""' <<<"$REQUIRED_JSON")
    if [[ "$src" =~ ^[A-Za-z0-9_-]+/[A-Za-z0-9_-] ]]; then echo "github"
    elif [[ "$src" =~ ^/ ]]; then echo "directory"
    elif [[ "$src" =~ ^https?:// ]]; then echo "url"
    else echo "unknown"; fi
  else
    jq -r --arg name "$1" '.extraKnownMarketplaces[$name].source.source // "unknown"' <<<"$SETTINGS_JSON"
  fi
}

# ---- Runtime queries ---------------------------------------------------------

runtime_market_present() {
  jq -e --arg name "$1" 'any(.[]; .name == $name)' <<<"$RUNTIME_MARKETS" >/dev/null
}
runtime_plugin_info() {
  # Returns {scope, enabled, version} for the plugin or an empty string.
  jq -c --arg id "$1" 'map(select(.id == $id))[0] // empty' <<<"$RUNTIME_PLUGINS"
}

runtime_plugin_has_host_entry() {
  # True if installed_plugins.json has an entry that applies to this host:
  # either user-scoped (applies everywhere) or project-scoped with
  # projectPath == REPO_ROOT. An entry with a different projectPath
  # (e.g. /workspace from a devcontainer session) will not load in this
  # environment and does not count.
  local pid="$1"
  [ -f "$INSTALLED_PLUGINS_FILE" ] || return 0  # file absent — skip check
  jq -e \
    --arg id "$pid" \
    --arg root "$REPO_ROOT" \
    '.plugins[$id] // []
     | any(.[]; .scope == "user" or (.scope == "project" and .projectPath == $root))' \
    "$INSTALLED_PLUGINS_FILE" >/dev/null 2>&1
}

# ---- 1. Declared marketplaces vs runtime -------------------------------------

declared_markets_list=()
while IFS= read -r name; do
  [ -n "$name" ] && declared_markets_list+=("$name")
done < <(declared_market_names)

for m in ${declared_markets_list[@]+"${declared_markets_list[@]}"}; do
  if runtime_market_present "$m"; then
    push_finding OK marketplace "$m" "registered at runtime"
  else
    kind=$(declared_market_kind "$m")
    src=$(declared_market_source_for_install "$m")
    push_finding FAIL marketplace "$m" \
      "declared in extraKnownMarketplaces ($kind) but not registered at runtime" \
      "claude plugin marketplace add $src" \
      add-marketplace "$src"
  fi
done

if runtime_market_present "claude-plugins-official"; then
  push_finding OK marketplace "claude-plugins-official" "auto-known, registered at runtime"
fi

# ---- 2. Declared plugins vs runtime ------------------------------------------

declared_plugins_list=()
while IFS= read -r id; do
  [ -n "$id" ] && declared_plugins_list+=("$id")
done < <(declared_plugin_ids)

for id in ${declared_plugins_list[@]+"${declared_plugins_list[@]}"}; do
  marketplace="${id##*@}"
  info=$(runtime_plugin_info "$id")
  if [ -z "$info" ]; then
    if runtime_market_present "$marketplace"; then
      push_finding FAIL plugin "$id" "declared but not installed" \
        "claude plugin install $id --scope project" \
        install "$id"
    else
      # Marketplace missing — installer will fix that first; plugin install can
      # follow on a second pass once the marketplace is registered.
      push_finding FAIL plugin "$id" \
        "declared but not installed; marketplace $marketplace also missing" \
        "add marketplace first, then: claude plugin install $id --scope project" \
        install "$id"
    fi
    continue
  fi
  enabled=$(jq -r '.enabled' <<<"$info")
  scope=$(jq -r '.scope' <<<"$info")
  if ! runtime_plugin_has_host_entry "$id"; then
    push_finding FAIL plugin "$id" \
      "registered by 'claude plugin list' but has no installPath for this host ($REPO_ROOT) — stale paths from a different environment (e.g. devcontainer /workspace)" \
      "claude plugin marketplace remove <marketplace> && claude plugin marketplace add <source> && claude plugin install $id --scope project" \
      reinstall "$id"
    continue
  fi
  if [ "$enabled" != "true" ]; then
    push_finding FAIL plugin "$id" "declared and installed (scope: $scope) but disabled" \
      "claude plugin enable $id" \
      enable "$id"
  elif [ "$scope" != "project" ]; then
    # Project scope is canonical for this monorepo. User scope (.claude-user/)
    # is a shared-via-repo workaround we tolerate but don't auto-migrate.
    push_finding WARN plugin "$id" \
      "enabled but installed at scope: $scope (project is canonical)" \
      "(manual) uninstall at $scope, then: claude plugin install $id --scope project"
  else
    push_finding OK plugin "$id" "installed at scope: project, enabled"
  fi
done

# ---- 3. Installed plugins not declared ---------------------------------------

# Plugins installed for a different project's path are not drift for this
# project. Only flag plugins that were explicitly installed here (scope=project,
# projectPath==REPO_ROOT) or at user scope (applies everywhere).

installed_for_this_project() {
  local pid="$1"
  [ -f "$INSTALLED_PLUGINS_FILE" ] || return 0
  jq -e \
    --arg id "$pid" \
    --arg root "$REPO_ROOT" \
    '.plugins[$id] // [] | any(.[]; .scope == "user" or (.scope == "project" and .projectPath == $root))' \
    "$INSTALLED_PLUGINS_FILE" >/dev/null 2>&1
}

while IFS=$'\t' read -r rid renabled rscope; do
  [ -z "$rid" ] && continue
  matched=0
  for did in ${declared_plugins_list[@]+"${declared_plugins_list[@]}"}; do
    [ "$did" = "$rid" ] && { matched=1; break; }
  done
  [ "$matched" -eq 1 ] && continue
  installed_for_this_project "$rid" || continue
  if [ "$renabled" = "true" ]; then
    push_finding WARN drift "$rid" \
      "installed and ENABLED at scope $rscope but not in enabledPlugins (loads silently every session)" \
      "declare it in enabledPlugins, or: claude plugin uninstall $rid"
  else
    push_finding INFO drift "$rid" \
      "installed but disabled at scope $rscope" \
      "claude plugin uninstall $rid"
  fi
done < <(jq -r '.[] | [.id, (.enabled|tostring), .scope] | @tsv' <<<"$RUNTIME_PLUGINS")

# ---- 4. Runtime marketplaces not declared ------------------------------------

while IFS=$'\t' read -r mname mkind mloc; do
  [ -z "$mname" ] && continue
  [ "$mname" = "claude-plugins-official" ] && continue
  matched=0
  for dm in ${declared_markets_list[@]+"${declared_markets_list[@]}"}; do
    [ "$dm" = "$mname" ] && { matched=1; break; }
  done
  [ "$matched" -eq 1 ] && continue
  push_finding INFO drift "$mname" \
    "marketplace registered at runtime ($mkind: $mloc) but not in extraKnownMarketplaces" \
    "declare it in extraKnownMarketplaces, or: claude plugin marketplace remove $mname"
done < <(jq -r '.[] | [.name, .source, ((.repo // .path // .url) // "")] | @tsv' <<<"$RUNTIME_MARKETS")

# Runtime plugin loading is intentionally NOT checked here — the /verify-setup
# slash command handles that by inspecting the live session's available skills,
# commands, and agents, which is the only reliable runtime signal.

# ---- Exit code ---------------------------------------------------------------

exit_code=$(jq -r 'if any(.[]; .level == "FAIL") then 1 else 0 end' <<<"$FINDINGS")

if [ "$QUIET" -eq 1 ]; then
  exit "$exit_code"
fi

if [ "$MODE" = "json" ]; then
  jq --argjson code "$exit_code" '{exit_code: $code, findings: .}' <<<"$FINDINGS"
  exit "$exit_code"
fi

# ---- Human-readable report ---------------------------------------------------

symbol() {
  case "$1" in
    OK)   printf '\xe2\x9c\x85' ;;  # green check
    FAIL) printf '\xe2\x9d\x8c' ;;  # red cross
    WARN) printf '\xe2\x9a\xa0\xef\xb8\x8f' ;;  # warning sign
    INFO) printf '\xe2\x84\xb9\xef\xb8\x8f' ;;  # info
    *)    printf '?' ;;
  esac
}

render_section() {
  local title="$1" filter="$2"
  local rows
  rows=$(jq -r --arg filter "$filter" '
    [.[] | select(.category == $filter)]
    | sort_by(.target)
    | .[] | [.level, .target, .message, .fix] | @tsv
  ' <<<"$FINDINGS")
  [ -z "$rows" ] && return
  printf '\n%s\n' "$title"
  while IFS=$'\t' read -r level target message fix; do
    [ -z "$level" ] && continue
    printf '  %s  %s — %s\n' "$(symbol "$level")" "$target" "$message"
    [ -n "$fix" ] && [ "$level" != "OK" ] && printf '         fix: %s\n' "$fix"
  done <<<"$rows"
  return 0
}

printf 'Plugin setup status (project: %s)\n' "$REPO_ROOT"
render_section "Marketplaces:" marketplace
render_section "Plugins:" plugin
render_section "Drift (runtime → settings):" drift

declared_count=${#declared_plugins_list[@]}
ok_declared=$(jq -r '[.[] | select(.category == "plugin" and .level == "OK")] | length' <<<"$FINDINGS")
fail_count=$(jq -r '[.[] | select(.level == "FAIL")] | length' <<<"$FINDINGS")
warn_count=$(jq -r '[.[] | select(.level == "WARN")] | length' <<<"$FINDINGS")
info_count=$(jq -r '[.[] | select(.level == "INFO")] | length' <<<"$FINDINGS")

printf '\nSummary: %d/%d declared plugins clean. %d FAIL, %d WARN, %d INFO.\n' \
  "$ok_declared" "$declared_count" "$fail_count" "$warn_count" "$info_count"

if [ "$exit_code" -eq 0 ] && [ "$warn_count" -eq 0 ] && [ "$info_count" -eq 0 ]; then
  printf 'All recommended plugins are installed and enabled. You are set.\n'
elif [ "$exit_code" -eq 0 ]; then
  printf 'No FAIL items. WARN/INFO are informational — reconcile by either declaring them in .claude/settings.json or removing them.\n'
else
  printf 'Run scripts/install-plugins.sh from a fresh terminal to fix FAIL items, then restart Claude Code.\n'
fi

exit "$exit_code"
