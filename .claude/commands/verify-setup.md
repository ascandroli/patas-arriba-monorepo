---
description: Check the recommended Claude Code plugins and marketplaces are installed for this project
version: "2026.05.27"
---

Verify this project's Claude Code setup in three passes:

1. Run the deterministic bash detector (`scripts/verify-plugins.sh`) for marketplaces and declared plugins. Print its output verbatim.
2. Perform a runtime check for marketplace plugins by inspecting the live session's available MCP tools and skills. The bash script cannot do this because `claude plugin list` reports install state, not whether the plugin is actually contributing capabilities to the current session.
3. Perform a runtime check for local plugins under `plugins/` by inspecting the live session's available skills, commands, and agents.

## Steps

### Step 1: run the deterministic detector

Run `scripts/verify-plugins.sh` via the Bash tool from the repo root. The script reads `required-plugins.yaml` as the source of truth, queries `claude plugin list --json` and `claude plugin marketplace list --json`, and emits a human-readable report. Exit code 0 means no FAIL; exit 1 means actionable drift; exit 2 means a missing dependency.

Print the script's output verbatim. Do not rephrase it.

If the script exits 2 (missing dependency or malformed settings), surface the error message verbatim and stop. Do not proceed to Step 2.

### Step 2: marketplace plugins — runtime check

For each plugin reported as ✅ installed by the bash detector, verify it is actually contributing capabilities to this session.

a. Extract the plugin's base name (everything before `@`). Normalize it to tool-name format: lowercase, hyphens → underscores (e.g. `typescript-lsp` → `typescript_lsp`).

b. Check for live evidence in the current session, in order of confidence:
   - **MCP tools** (highest confidence): look for tools whose names match `mcp__<normalized-name>__*` in the list of tools available to you right now — both the immediately callable tools and the deferred tools listed in the `<system-reminder>` blocks visible in this conversation.
   - **Skills with plugin prefix** (high confidence): look for skills prefixed `<base-name>:` in the available-skills list in `<system-reminder>`. Marketplace plugins load with their name as prefix (unlike local plugins).
   - **Commands with plugin prefix** (medium confidence): look for invocable slash commands named `<base-name>:*` or `<base-name>/<something>`.

c. Classify each plugin:
   - **LOADED** if at least one MCP tool, prefixed skill, or prefixed command is found.
   - **NOT LOADED** if nothing is found. This means the plugin is declared and installed on disk but is not contributing to this session — likely stale install paths (e.g. `/workspace/...` entries in `installed_plugins.json` that resolve to a non-existent path on the current host).

d. Print a section titled `Marketplace plugins (runtime check):` with one line per plugin, using the same icons:
   - `✅  <name> — loaded (matched: tool 'X', skill 'Y', ...)`
   - `❌  <name> — installed on disk but NOT loaded in this session. Reinstall from the current host and restart Claude Code.`

Be honest. Do not infer that a plugin is loaded because it *should* be. If you cannot find any of its tools or prefixed skills in your current context, it is NOT loaded.

### Step 3: live check for local plugins

For each subdirectory of `plugins/` in the repo, decide whether it is actually loaded in the current session.

a. List `plugins/*/` directories (skip hidden dirs).
b. For each directory, read its inventory:
   - Skills: directory names under `plugins/<name>/skills/` (one skill per subdir, each containing `SKILL.md`).
   - Commands: filenames without `.md` extension under `plugins/<name>/commands/`.
   - Agents: filenames without `.agent.md` extension under `plugins/<name>/agents/`.
c. Compare those names against the live session's available capabilities (the names you, Claude, can actually see in this conversation):
   - Skills appear in the available-skills list. Local-plugin skills load WITHOUT the `<plugin-name>:` prefix that marketplace plugins use.
   - Commands appear as invocable slash commands.
   - Agents appear in the available agent types list.

   **Discount ambiguous matches.** Anything also present under `.claude/skills/<name>/`, `.claude/commands/<name>.md`, `.claude/agents/<name>.agent.md` (or the same paths under `.claude-user/`) loads from there directly and proves nothing about `--plugin-dir`. List those directories first with `ls .claude/agents/ .claude/skills/ .claude/commands/ .claude-user/agents/ .claude-user/skills/ .claude-user/commands/ 2>/dev/null` and exclude any plugin asset whose name also appears there.

   Be especially suspicious of plugins where only a small subset of declared assets match (e.g. 5 of 13 agents and 0 of 30 skills). That pattern usually means a few files were copy-installed into `.claude/` while the plugin itself is not loaded. A loaded plugin makes ALL its skills and commands visible, not a handful.
d. Classify each local plugin:
   - **LOADED** if at least one unambiguous match (after the discount above) is visible in the session. Prefer skill or command evidence over agent evidence, since `.claude/agents/` is the most common place for ad-hoc installs.
   - **NOT LOADED** if no unambiguous matches remain AND the directory looks like a real plugin (has `.claude-plugin/plugin.json`, `plugin.json`, `skills/`, `commands/`, or `agents/`).
   - **INVALID** if the directory exists but does not look like a real plugin.
e. Print a section titled `Local plugins (runtime check):` with one line per plugin. Use the same status icons as `scripts/verify-plugins.sh` (✅ for OK, ⚠️ for WARN, ❌ for FAIL) so a reader can scan both sections at the same glance:
   - `✅  <name> — loaded (matched: skill 'X', agent 'Y', ...)`
   - `⚠️  <name> — present on disk but NOT loaded in this session. Relaunch via 'make devcontainer-claude' to pick it up.`
   - `❌  <name> — directory exists but has no plugin manifest or skills/commands/agents.`

Be honest about evidence. If you cannot find any of the plugin's declared assets in the session's available capabilities, it is NOT loaded, regardless of what is on disk.

### Step 4: closing line

Combine the bash exit code with both runtime checks:

- Bash exit 0, all marketplace plugins LOADED, all local plugins LOADED, no WARN/INFO from the script: stay silent. The script already said "You are set."
- Bash exit 0 but one or more **marketplace plugins NOT LOADED**: tell the user to run `scripts/install-plugins.sh` from a fresh terminal to reinstall from the current host, then restart Claude Code. The likely cause is stale `/workspace/...` paths in `installed_plugins.json` from a previous devcontainer session.
- Bash exit 0 but one or more **local plugins NOT LOADED**: tell the user to relaunch Claude Code via `make devcontainer-claude` so the `--plugin-dir` flags take effect. Suggest they exit the current session first.
- Bash exit 0 with WARN or INFO from the script: highlight anything worth knowing in one short sentence (e.g. a scope mismatch). Otherwise silent.
- Bash exit 1: tell the user to run `scripts/install-plugins.sh` from a fresh terminal (outside this Claude Code session) to fix the FAIL items, then restart Claude Code so the new plugins load. Add `--dry-run` to preview first if they want.

### Step 5: do not auto-fix

Do not run `scripts/install-plugins.sh` yourself. Plugin installs should run from a fresh terminal so they do not collide with the active session, and they require a restart anyway. The same applies to the local-plugin "not loaded" case: do not try to load plugins mid-session; advise a relaunch.

## Constraints

- Use only the Bash tool to run the detector. Do not reimplement its logic.
- No preamble. Go straight to the bash report.
- For Steps 2 and 3, do not invent matches. If you are uncertain whether a name is visible in the session, treat it as not loaded.
- Do not list every matched skill in the OK message; one or two examples is enough.

