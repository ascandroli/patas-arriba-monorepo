# Choice-story records

Decision-archaeology records produced by the `/choice-cartographer` agent, one
per spec at `<spec-slug>.md`. Each story captures a material decision the spec
has committed to — including the silent ones — as a Henney-style pattern story
for human disposition.

The **PRs have adjudicated choice stories** constraint in `HARNESS.md` requires
every non-exempt PR to carry a story record whose every story has `disposition`
set to `accepted`, `revisit`, or `promoted` (no `pending` values). Specs
predating the workflow are exempt via a `cartographer: exempt-pre-existing` line
in their frontmatter.
