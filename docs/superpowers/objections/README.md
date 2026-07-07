# Objection records

Adversarial-review records produced by the `/diaboli` (advocatus-diaboli)
agent. Two records may exist per spec:

- `<spec-slug>.md` — spec-mode objections, produced after the spec is written
- `<spec-slug>-code.md` — code-mode objections, produced after the final
  code-review PASS

The **PRs have adjudicated objections** constraint in `HARNESS.md` requires
every non-exempt feature/behaviour-change PR to carry these records with all
dispositions resolved (no `pending` values). Specs predating the workflow are
exempt via a `diaboli: exempt-pre-existing` line in their frontmatter.
