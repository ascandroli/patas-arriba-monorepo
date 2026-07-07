# Bug: gc-rotate.sh emits false positives for shell scripts in node_modules and .claude-user

## Affected file

`hooks/scripts/gc-rotate.sh` — the rotating GC check that runs as a Stop hook at session end.

## Affected rules (by `rule_index`)

- **rule 2** — "Shell scripts syntax": runs `bash -n` on every `.sh` file
- **rule 3** — "Shell scripts strict mode": checks every `.sh` file for `set -euo pipefail` in the first 15 lines

## Root cause

Both rules use:

```bash
find "$PROJECT_DIR" -name "*.sh" -not -path "*/.git/*" 2>/dev/null
```

The only exclusion is `.git/`. Any project that has `node_modules/` (e.g. npm/yarn workspaces), `.claude-user/` (Claude Code plugin cache), or other third-party script trees will have all those files scanned. None of those scripts are owned by the project, so findings against them are false positives the project cannot fix.

## Observed false positives

On a Node.js monorepo with Playwright and bcrypt as dependencies, rule 3 flagged:

```
.claude-user/plugins/marketplaces/claude-plugins-official/plugins/explanatory-output-style/hooks-handlers/session-start.sh
.claude-user/plugins/marketplaces/claude-plugins-official/plugins/learning-output-style/hooks-handlers/session-start.sh
.claude-user/plugins/marketplaces/claude-plugins-official/plugins/math-olympiad/skills/math-olympiad/scripts/check_latex.sh
.claude-user/plugins/marketplaces/claude-plugins-official/plugins/security-guidance/hooks/sg-python.sh
.claude-user/shell-snapshots/snapshot-zsh-*.sh
node_modules/bcrypt/build-all.sh
node_modules/playwright-core/bin/reinstall_chrome_beta_linux.sh
node_modules/playwright-core/bin/reinstall_chrome_beta_mac.sh
node_modules/playwright-core/bin/reinstall_chrome_stable_linux.sh
node_modules/playwright-core/bin/reinstall_chrome_stable_mac.sh
node_modules/playwright-core/bin/reinstall_msedge_*.sh
server/node_modules/bcrypt/build-all.sh
server/node_modules/jake/bin/bash_completion.sh
```

19 files total — only 1 of which was actually project-owned.

## Secondary issue

Rule 3's grep pattern only matches the literal string `set -euo pipefail`. A script that intentionally omits `-e` and documents the reason with a comment (e.g. `# -e intentionally omitted: exit codes captured manually`) is still flagged, even though the omission is deliberate and documented.

## Fix applied locally

In `gc-rotate.sh`, both `find` calls were changed to exclude the unowned paths:

```bash
find "$PROJECT_DIR" -name "*.sh" \
  -not -path "*/.git/*" \
  -not -path "*/node_modules/*" \
  -not -path "*/.claude-user/*" \
  2>/dev/null
```

Rule 3's grep was broadened to also accept intentional-omission comments:

```bash
grep -qE "set -euo pipefail|intentionally omitted"
```

And the escape-hatch comment in the flagged hook was moved to lines 2–3 (within the `head -15` window) so the pattern match works.

## Suggested fix for upstream

Add `-not -path "*/node_modules/*"` and `-not -path "*/.claude-user/*"` exclusions to both `find` calls in rules 2 and 3. Consider also accepting a documented escape-hatch comment as an alternative to the literal `set -euo pipefail` line.
