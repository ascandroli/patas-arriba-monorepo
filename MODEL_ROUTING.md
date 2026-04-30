# Model Routing

<!-- This file guides the orchestrator when dispatching agents to different
     model tiers. The goal is to use the cheapest model that can reliably
     handle each agent's task type — without sacrificing quality on tasks
     that genuinely require stronger reasoning.

     Update this file whenever you add a new agent or discover that a
     routing decision is producing poor results. -->

## Agent Routing Table

| Agent | Tier | Rationale |
| ----- | ---- | --------- |
| orchestrator | Flagship | Coordinates the full pipeline, makes judgment calls about plan approval, review escalation, and skipping stages — requires strong reasoning |
| spec-writer | Flagship | Producing precise acceptance scenarios and functional requirements that drive tests and implementation demands careful thinking |
| tdd-agent | Balanced | Translating well-specified scenarios into test code is a structured task; a mid-tier model handles it well |
| code-reviewer | Balanced | Applying CUPID and literate programming lenses is systematic; a mid-tier model can work through the checklist reliably |
| integration-agent | Efficient | CHANGELOG updates, commit messages, and PR descriptions are templated tasks; a fast, cheap model is sufficient |

<!-- Tier mapping for this project:
     Flagship  → claude-opus-4-7  (strong reasoning, used sparingly)
     Balanced  → claude-sonnet-4-6
     Efficient → claude-haiku-4-5

     These names match Anthropic's current model identifiers. Update this
     section when newer models are released or when routing decisions
     prove wrong in practice. -->

## Token Budget Guidance

| Task type | Suggested max tokens | Notes |
| --------- | ------------------- | ----- |
| Spec writing | 8 000 | Enough for a user story, 3–5 scenarios, and a plan section |
| Test generation | 4 000 | Failing tests are small; the limit prevents over-engineering |
| Implementation (per file) | 6 000 | If a single file needs more, it may be doing too much |
| Code review | 4 000 | Findings should be concise; a long review is a smell |
| CHANGELOG + commit | 2 000 | Templated task; constrain to prevent padding |
| Orchestrator planning | 2 000 | Planning summaries should be short |

<!-- These are starting points, not hard limits. Adjust based on observed
     token usage in your pipeline runs. Consistently hitting limits is a
     signal that either the task is too large or the prompt is too verbose. -->

## When to override

Override the routing table when:

- A task is unexpectedly complex and the assigned tier is producing poor output.
  Escalate to the next tier and note the exception in AGENTS.md → GOTCHAS.

- A task is simpler than expected and you want to save cost. Move down a tier
  only if you have verified the output quality does not degrade.

Do not override silently — record the reason in the context object so the
orchestrator can learn from it.

## Cost capture

Run `/cost-capture` quarterly to record actual spend per model tier, then
update the rationale column above if observed costs change the trade-off.
