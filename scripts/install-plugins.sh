#!/usr/bin/env bash
# Version: 2026.05.27
# Idempotent fixer for plugin drift detected by verify-plugins.sh.
#
# Reads the structured `action` field from each FAIL finding and runs the
# corresponding `claude plugin ...` command. Order matters: marketplaces are
# added before plugins so install commands targeting those marketplaces can
# resolve. No eval, no shell metachar parsing — every argument is passed via
# bash arrays.
#
# Never auto-uninstalls. Never auto-migrates scope. WARN and INFO items stay
# the user's call.

set -euo pipefail

usage() {
  cat <<'EOF'
Usage: install-plugins.sh [--dry-run] [--verbose]

Fixes plugin drift detected by verify-plugins.sh. Idempotent — safe to re-run.

Options:
  --dry-run   Print the commands that would run, but don't execute them
  --verbose   Show the detector's JSON report before fixing
  -h, --help  Show this help

Fixable (FAIL) items:
  add-marketplace   claude plugin marketplace add <source>
  install           claude plugin install <id> --scope project
  enable            claude plugin enable <id>

Not fixed automatically (manual review):
  WARN  scope mismatch (project canonical), enabled-but-undeclared
  INFO  installed-but-disabled leftover, undeclared runtime marketplace,
        broken local --plugin-dir entry
EOF
}

DRY_RUN=0
VERBOSE=0
for arg in "$@"; do
  case "$arg" in
    --dry-run) DRY_RUN=1 ;;
    --verbose) VERBOSE=1 ;;
    -h|--help) usage; exit 0 ;;
    *) echo "install-plugins.sh: unknown arg: $arg" >&2; usage >&2; exit 2 ;;
  esac
done

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VERIFY="$SCRIPT_DIR/verify-plugins.sh"
[ -x "$VERIFY" ] || { echo "install-plugins.sh: $VERIFY not found or not executable" >&2; exit 2; }

command -v jq >/dev/null 2>&1 || { echo "install-plugins.sh: missing dependency: jq" >&2; exit 2; }
command -v claude >/dev/null 2>&1 || { echo "install-plugins.sh: missing dependency: claude" >&2; exit 2; }

# Resolve known_marketplaces.json path (same logic as verify-plugins.sh).
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
if [ -n "${CLAUDE_CONFIG_DIR:-}" ]; then
  if [[ "$CLAUDE_CONFIG_DIR" = /* ]]; then
    KNOWN_MARKETS_FILE="$CLAUDE_CONFIG_DIR/plugins/known_marketplaces.json"
  else
    KNOWN_MARKETS_FILE="$REPO_ROOT/$CLAUDE_CONFIG_DIR/plugins/known_marketplaces.json"
  fi
else
  KNOWN_MARKETS_FILE="$HOME/.claude/plugins/known_marketplaces.json"
fi

# Parse required-plugins.yaml for marketplace source URLs (preferred over
# known_marketplaces.json, which is managed by the claude CLI and may be stale).
REQUIRED_PLUGINS_FILE="$REPO_ROOT/required-plugins.yaml"
YAML_MARKETS_JSON=""
if [ -f "$REQUIRED_PLUGINS_FILE" ] && command -v python3 >/dev/null 2>&1; then
  YAML_MARKETS_JSON=$(python3 - "$REQUIRED_PLUGINS_FILE" <<'PYEOF'
import re, json, sys
text = open(sys.argv[1]).read()
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
print(json.dumps(markets))
PYEOF
  ) || YAML_MARKETS_JSON=""
fi

yaml_market_source() {
  [ -n "$YAML_MARKETS_JSON" ] || return 1
  local src
  src=$(jq -r --arg m "$1" '.[$m].source // empty' <<<"$YAML_MARKETS_JSON" 2>/dev/null) || return 1
  [ -n "$src" ] && echo "$src"
}

# Capture the detector's report. Don't let its exit code abort us — that's
# exactly why we're here.
set +e
report=$("$VERIFY" --json 2>/dev/null)
verify_exit=$?
set -e

[ "$VERBOSE" -eq 1 ] && jq . <<<"$report" >&2

if [ "$verify_exit" -eq 0 ]; then
  echo "No FAIL items — nothing to install. Re-run verify-plugins.sh to see WARN/INFO drift."
  exit 0
fi

# run_claude SUBCOMMAND ARG... — wrapper that respects --dry-run.
run_claude() {
  if [ "$DRY_RUN" -eq 1 ]; then
    printf '[dry-run] claude'
    printf ' %q' "$@"
    printf '\n'
  else
    printf '+ claude'
    printf ' %q' "$@"
    printf '\n'
    claude "$@"
  fi
}

# 1) Marketplaces first. A plugin install whose marketplace isn't registered
#    would fail; fixing marketplaces in this pass means the plugin pass below
#    succeeds.
mp_count=0
while IFS=$'\t' read -r target action_arg; do
  [ -z "$target" ] && continue
  printf 'Marketplace: %s\n' "$target"
  run_claude plugin marketplace add "$action_arg"
  mp_count=$((mp_count + 1))
done < <(jq -r '
  .findings[]
  | select(.level == "FAIL" and .action.kind == "add-marketplace")
  | [.target, .action.arg] | @tsv
' <<<"$report")

# 2) Plugins. Three action kinds: install (missing), enable (installed-disabled),
#    reinstall (stale paths). For reinstall, the marketplace remove+add is
#    deduplicated: multiple plugins from the same marketplace share one refresh.
plugin_count=0
refreshed_marketplaces=()
while IFS=$'\t' read -r kind target action_arg; do
  [ -z "$target" ] && continue
  case "$kind" in
    install)
      printf 'Plugin install: %s\n' "$target"
      run_claude plugin install "$action_arg" --scope project
      ;;
    enable)
      printf 'Plugin enable: %s\n' "$target"
      run_claude plugin enable "$action_arg"
      ;;
    reinstall)
      # Stale install paths from a different environment (e.g. devcontainer /workspace).
      # Fix by removing and re-adding the marketplace (re-downloads to current host paths),
      # then reinstalling the plugin. Deduped: if multiple plugins share the same
      # marketplace, remove+add runs only once for that marketplace.
      printf 'Plugin reinstall (stale paths): %s\n' "$target"
      marketplace="${action_arg##*@}"
      already_refreshed=0
      for rm in "${refreshed_marketplaces[@]+"${refreshed_marketplaces[@]}"}"; do
        [ "$rm" = "$marketplace" ] && { already_refreshed=1; break; }
      done
      if [ "$already_refreshed" -eq 0 ]; then
        mp_source=$(yaml_market_source "$marketplace" || \
          jq -r --arg m "$marketplace" '.[$m].source | .repo // .path // .url // ""' \
            "$KNOWN_MARKETS_FILE" 2>/dev/null || echo "")
        if [ -n "$mp_source" ]; then
          run_claude plugin marketplace remove "$marketplace" || true
          run_claude plugin marketplace add "$mp_source"
          mp_count=$((mp_count + 1))
          refreshed_marketplaces+=("$marketplace")
        else
          printf '  note: marketplace %s not found in required-plugins.yaml or known_marketplaces.json — skipping refresh\n' "$marketplace"
        fi
      fi
      run_claude plugin install "$action_arg" --scope project
      ;;
    *)
      printf 'install-plugins.sh: skipping unknown action kind: %s for %s\n' "$kind" "$target" >&2
      continue
      ;;
  esac
  plugin_count=$((plugin_count + 1))
done < <(jq -r '
  .findings[]
  | select(.level == "FAIL" and .category == "plugin")
  | [.action.kind, .target, .action.arg] | @tsv
' <<<"$report")

# 3) Local --plugin-dir FAIL items have no automated fix — directory missing
#    on disk means a Makefile entry points to nothing. Surface them but don't
#    pretend to fix them.
local_fails=$(jq -r '[.findings[] | select(.level == "FAIL" and .category == "local-plugin")] | length' <<<"$report")
if [ "$local_fails" -gt 0 ]; then
  printf 'WARN: %d local --plugin-dir entr%s broken (directory missing on disk). Fix the Makefile or the plugins/ tree manually.\n' \
    "$local_fails" "$([ "$local_fails" -eq 1 ] && echo y || echo ies)"
fi

printf '\nApplied: %d marketplace(s), %d plugin action(s).\n' "$mp_count" "$plugin_count"

if [ "$DRY_RUN" -eq 1 ]; then
  printf 'Dry run complete. Re-run without --dry-run to apply.\n'
  exit 0
fi

# Re-verify and report. claude plugin install may need a session restart to take
# effect, so the exit code from this final check tells you whether to restart.
printf '\nRe-running detector to confirm:\n'
"$VERIFY"
