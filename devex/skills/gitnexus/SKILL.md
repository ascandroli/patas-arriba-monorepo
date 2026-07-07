---
name: gitnexus
description: "Invoke to work 'the GitNexus way' on a task — drive the change through the GitNexus knowledge-graph MCP tools with full rigor: impact analysis before every symbol edit, detect_changes before commits, query/context for exploration, guided renames for refactors. Use when the user says things like \"use /gitnexus to fix THIS\", \"/gitnexus to debug that\", or \"do this the GitNexus way\". For everyday code questions the project default is CodeGraph (see .claude/CLAUDE.md) — reach for this skill only when the user explicitly asks for GitNexus or wants its execution-flow/impact rigor."
---

# GitNexus — work the graph-first way

This skill exists so GitNexus can be **fully optional but fully powerful**: the
project's always-on code-intelligence tool is CodeGraph, so GitNexus no longer
lives in `CLAUDE.md` as a standing mandate. Instead, when the user explicitly
asks to work "the GitNexus way", this skill turns on the rigorous,
impact-analysis-first workflow that GitNexus is good at — call-graph blast radius
before edits, execution-flow tracing for debugging, and graph-aware renames.

Once invoked, treat the steps below as binding **for the duration of that task**.
That is the point of invoking it: the user is asking for the disciplined,
graph-verified way, not the fast way.

> This project is indexed by GitNexus as **patas-arriba-monorepo**. The index is
> local and gitignored (`.gitnexus/`) and can lag the working tree — read live
> stats from `.gitnexus/meta.json`, not a hardcoded count. If any GitNexus tool
> warns the index is stale, run `npx gitnexus analyze` in a terminal first.

## Always Do (while this skill is active)

- **Run impact analysis before editing any symbol.** Before modifying a function,
  class, or method, run `gitnexus_impact({target: "symbolName", direction: "upstream"})`
  and report the blast radius (direct callers, affected processes, risk level) to
  the user.
- **Run `gitnexus_detect_changes()` before committing** to verify your changes
  only affect the expected symbols and execution flows.
- **Warn the user** if impact analysis returns HIGH or CRITICAL risk before
  proceeding with edits.
- When exploring unfamiliar code, use `gitnexus_query({query: "concept"})` to find
  execution flows instead of grepping — it returns process-grouped results ranked
  by relevance.
- For full context on a specific symbol — callers, callees, which execution flows
  it participates in — use `gitnexus_context({name: "symbolName"})`.

## When Debugging

1. `gitnexus_query({query: "<error or symptom>"})` — find execution flows related to the issue
2. `gitnexus_context({name: "<suspect function>"})` — see all callers, callees, and process participation
3. `READ gitnexus://repo/patas-arriba-monorepo/process/{processName}` — trace the full execution flow step by step
4. For regressions: `gitnexus_detect_changes({scope: "compare", base_ref: "main"})` — see what your branch changed

## When Refactoring

- **Renaming**: use `gitnexus_rename({symbol_name: "old", new_name: "new", dry_run: true})`
  first. Review the preview — graph edits are safe, text_search edits need manual
  review. Then run with `dry_run: false`.
- **Extracting/Splitting**: run `gitnexus_context({name: "target"})` to see all
  incoming/outgoing refs, then `gitnexus_impact({target: "target", direction: "upstream"})`
  to find all external callers before moving code.
- After any refactor: run `gitnexus_detect_changes({scope: "all"})` to verify only
  expected files changed.

## Never Do (while this skill is active)

- NEVER edit a function, class, or method without first running `gitnexus_impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `gitnexus_rename`, which understands the call graph.
- NEVER commit changes without running `gitnexus_detect_changes()` to check affected scope.

## Tools Quick Reference

| Tool | When to use | Command |
|------|-------------|---------|
| `query` | Find code by concept / flow | `gitnexus_query({query: "auth validation"})` |
| `context` | 360-degree view of one symbol | `gitnexus_context({name: "validateUser"})` |
| `impact` | Blast radius before editing | `gitnexus_impact({target: "X", direction: "upstream"})` |
| `detect_changes` | Pre-commit scope check | `gitnexus_detect_changes({scope: "staged"})` |
| `rename` | Safe multi-file rename | `gitnexus_rename({symbol_name: "old", new_name: "new", dry_run: true})` |
| `cypher` | Custom graph queries | `gitnexus_cypher({query: "MATCH ..."})` |

## Impact Risk Levels

| Depth | Meaning | Action |
|-------|---------|--------|
| d=1 | WILL BREAK — direct callers/importers | MUST update these |
| d=2 | LIKELY AFFECTED — indirect deps | Should test |
| d=3 | MAY NEED TESTING — transitive | Test if critical path |

## Resources

| Resource | Use for |
|----------|---------|
| `gitnexus://repo/patas-arriba-monorepo/context` | Codebase overview, check index freshness |
| `gitnexus://repo/patas-arriba-monorepo/clusters` | All functional areas |
| `gitnexus://repo/patas-arriba-monorepo/processes` | All execution flows |
| `gitnexus://repo/patas-arriba-monorepo/process/{name}` | Step-by-step execution trace |

## Self-Check Before Finishing

Before completing a task run under this skill, verify:
1. `gitnexus_impact` was run for all modified symbols
2. No HIGH/CRITICAL risk warnings were ignored
3. `gitnexus_detect_changes()` confirms changes match expected scope
4. All d=1 (WILL BREAK) dependents were updated

## Keeping the Index Fresh

After committing code changes, the GitNexus index becomes stale. Re-run analyze
to update it:

```bash
npx gitnexus analyze
npx gitnexus analyze --embeddings   # preserve embeddings (omitting the flag deletes them)
```

Check whether embeddings exist in `.gitnexus/meta.json` — the `stats.embeddings`
field shows the count (0 means none).

## Deep-dive sub-skills

For task-specific playbooks, load the matching sub-skill:

| Task | Sub-skill |
|------|-----------|
| Understand architecture / "How does X work?" | `devex/skills/gitnexus/gitnexus-exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `devex/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `devex/skills/gitnexus/gitnexus-debugging/SKILL.md` |
| Rename / extract / split / refactor | `devex/skills/gitnexus/gitnexus-refactoring/SKILL.md` |
| Tools, resources, schema reference | `devex/skills/gitnexus/gitnexus-guide/SKILL.md` |
| Index, status, clean, wiki CLI commands | `devex/skills/gitnexus/gitnexus-cli/SKILL.md` |
