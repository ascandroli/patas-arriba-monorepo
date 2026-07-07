#!/usr/bin/env bash
# Thin wrapper around the upstream archive-promoted-reflections.sh that ships
# inside the ai-literacy-superpowers plugin cache.
#
# WHY this exists: the plugin is not vendored into this repo — it runs from the
# per-machine cache under .claude-user/plugins/cache/, whose path carries the
# plugin version (e.g. .../0.64.0/scripts/...). Pointing a HARNESS.md GC-rule
# Tool: field straight at that path would break on every plugin upgrade. So the
# GC rule "Reflection log archival of promoted entries" points at THIS stable
# repo-local path instead; the wrapper resolves the cache location and the
# newest installed version at runtime and dispatches.
#
# The upstream script defaults ACTIVE_DIR=reflections/active and
# ARCHIVE_DIR=reflections/archive, which already match this repo's layout, so
# no path patching is needed (unlike avatia/monorepo, where the wrapper pattern
# originated and the archive had been relocated under docs/).

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"  # devex/scripts/ -> repo root
PLUGIN_BASE="${CLAUDE_CONFIG_DIR:-$REPO_ROOT/.claude-user}/plugins/cache/ai-literacy-superpowers/ai-literacy-superpowers"

if [ ! -d "$PLUGIN_BASE" ]; then
  echo "ai-literacy-superpowers plugin cache not found at $PLUGIN_BASE" >&2
  echo "Install the plugin (see devex/scripts/install-plugins.sh) before running this rule." >&2
  exit 1
fi

# Newest installed version wins — sort -V understands semver ordering.
LATEST="$(ls -1 "$PLUGIN_BASE" | sort -V | tail -n 1)"
if [ -z "$LATEST" ]; then
  echo "No installed version found under $PLUGIN_BASE" >&2
  exit 1
fi

UPSTREAM="$PLUGIN_BASE/$LATEST/scripts/archive-promoted-reflections.sh"
if [ ! -f "$UPSTREAM" ]; then
  echo "Upstream script missing: $UPSTREAM" >&2
  exit 1
fi

cd "$REPO_ROOT"
exec bash "$UPSTREAM" "$@"
