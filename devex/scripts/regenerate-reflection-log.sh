#!/usr/bin/env bash
# Thin wrapper around the upstream regenerate-reflection-log.sh in the
# ai-literacy-superpowers plugin cache. Rebuilds the generated aggregate
# REFLECTION_LOG.md from the per-entry fragments in reflections/active/.
#
# Same rationale as devex/scripts/archive-promoted-reflections.sh: the plugin runs
# from the versioned per-machine cache, so a stable repo-local path is needed
# for docs and manual invocation to survive plugin upgrades. Run after adding
# or editing a fragment in reflections/active/.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"  # devex/scripts/ -> repo root
PLUGIN_BASE="${CLAUDE_CONFIG_DIR:-$REPO_ROOT/.claude-user}/plugins/cache/ai-literacy-superpowers/ai-literacy-superpowers"

if [ ! -d "$PLUGIN_BASE" ]; then
  echo "ai-literacy-superpowers plugin cache not found at $PLUGIN_BASE" >&2
  echo "Install the plugin (see devex/scripts/install-plugins.sh) before running this rule." >&2
  exit 1
fi

LATEST="$(ls -1 "$PLUGIN_BASE" | sort -V | tail -n 1)"
if [ -z "$LATEST" ]; then
  echo "No installed version found under $PLUGIN_BASE" >&2
  exit 1
fi

UPSTREAM="$PLUGIN_BASE/$LATEST/scripts/regenerate-reflection-log.sh"
if [ ! -f "$UPSTREAM" ]; then
  echo "Upstream script missing: $UPSTREAM" >&2
  exit 1
fi

cd "$REPO_ROOT"
exec bash "$UPSTREAM" "$@"
