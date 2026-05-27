#!/usr/bin/env bash
# set -e intentionally omitted: exit code from verify-plugins.sh is captured
# manually so the hook can emit a structured message instead of exiting early.
# Version: 2026.05.27
# SessionStart hook: ensure the teammate knows whether the project plugins are
# loaded correctly. Behaviour depends on the surface running Claude Code:
#
#   TUI (real terminal, e.g. `make devcontainer-claude` or a direct `claude` invocation):
#     Run the deterministic background drift check (scripts/verify-plugins.sh)
#     and emit findings + the /verify-setup tip via {"systemMessage": "..."},
#     which Claude Code renders as a banner. The user reads it directly off
#     the terminal. The model is intentionally not in the loop.
#
#   Headless / non-TTY (Claude Desktop opens claude over ssh+docker exec with
#   TERM=dumb): systemMessage has nowhere to render, and the background drift
#   check is misleading anyway because it inspects `claude plugin list` from
#   the CLI and can't see what Desktop actually loaded in this session.
#     Instead, instruct the model via hookSpecificOutput.additionalContext to
#     run the /verify-setup slash command and present results to the user as a
#     session-start banner. /verify-setup is a live in-session check that
#     reflects the actual loaded skills/commands/agents — the ground truth.
#
# Hook stdout is always parsed by Claude Code as JSON. Plain text echoes are
# silently discarded, so every output path must be a JSON envelope.
#
# To opt out, drop a file at .claude/skip-verify-setup or remove this hook
# from .claude/settings.json.

set -uo pipefail

# Resolve project root from this script's own location: .claude/hooks/<this>.sh.
# $CLAUDE_PROJECT_DIR is not reliably propagated to the hook's child shell.
script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
project_dir="$(cd "$script_dir/../.." && pwd)"

# Opt-out: drop a file at .claude/skip-verify-setup to disable this hook
# without removing it from .claude/settings.json. Honored by both surfaces.
if [[ -f "$project_dir/.claude/skip-verify-setup" ]]; then
  exit 0
fi

# ---------- Headless / Claude Desktop path ----------
# TERM=dumb is the signal Claude Desktop's ssh+docker exec sets when it spawns
# claude. A real terminal sets a meaningful TERM (xterm-256color, screen-256,
# etc.). The mismatch is reliable enough for our two known surfaces, and if it
# ever misfires the worst case is "we ask the model to run /verify-setup" —
# still useful.
if [[ "${TERM:-}" == "dumb" ]]; then
  directive='Run the /verify-setup slash command now. Present its findings to the user as the first thing in your reply, before any other content, then continue normally.'
  if command -v jq >/dev/null 2>&1; then
    jq -n --arg ctx "$directive" '{
      hookSpecificOutput: {
        hookEventName: "SessionStart",
        additionalContext: $ctx
      }
    }'
  else
    escaped="${directive//\\/\\\\}"
    escaped="${escaped//\"/\\\"}"
    printf '{"hookSpecificOutput":{"hookEventName":"SessionStart","additionalContext":"%s"}}\n' "$escaped"
  fi
  exit 0
fi

# ---------- TUI path ----------

TIP="Tip: run /verify-setup for a deeper runtime check — it inspects which plugins are actually contributing capabilities to this session."
message=""

emit() {
  if command -v jq >/dev/null 2>&1; then
    jq -n --arg msg "$1" '{systemMessage: $msg}'
  else
    local escaped="${1//\\/\\\\}"
    escaped="${escaped//\"/\\\"}"
    escaped="${escaped//$'\n'/\\n}"
    printf '{"systemMessage":"%s"}\n' "$escaped"
  fi
}

cleanup() {
  if [[ -n "$message" ]]; then
    emit "${message}"$'\n\n'"${TIP}"
  else
    emit $'\n\n'"$TIP"
  fi
}
trap cleanup EXIT

verify_script="$project_dir/scripts/verify-plugins.sh"
if [[ ! -x "$verify_script" ]]; then
  exit 0
fi

# Hard timeout: cap the wait so the hook does not hang if the claude CLI is
# locked or mid-init during SessionStart.
if command -v timeout >/dev/null 2>&1; then
  output=$(timeout 10s "$verify_script" 2>&1)
  exit_code=$?
else
  output=$("$verify_script" 2>&1)
  exit_code=$?
fi

if [[ $exit_code -eq 124 ]]; then
  message="Plugin drift check skipped: scripts/verify-plugins.sh timed out (claude CLI likely locked during session startup)."
elif [[ $exit_code -ne 0 ]]; then
  message="${output}"$'\n\n'"Plugin drift detected (exit ${exit_code}). Run scripts/install-plugins.sh from a fresh terminal to fix, then restart Claude Code."
fi

exit 0
