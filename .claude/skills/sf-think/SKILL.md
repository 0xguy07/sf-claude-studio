---
name: sf-think
description: "Request deeper analysis on the next response. Sets a session-scoped flag so the next non-trivial answer thinks harder before responding — closer to extended-thinking style."
argument-hint: "[low | medium | high (default)]"
user-invocable: true
allowed-tools: Write, Read
model: haiku
---

This is a session control. The user is asking the next response to think more carefully — not to invoke a different model, but to shift the *style* of the next answer.

## Phase 1: Parse the argument

Accept `low`, `medium`, `high`, or no argument (defaults to `high`).

| Level | What it means for the next response |
|-|-|
| `low` | Default behavior. Used to clear a previously-set higher level. |
| `medium` | Slow down on the next non-trivial decision. List 2–4 options and the trade-off explicitly even when the answer feels obvious. |
| `high` | Treat the next request as architecturally significant. Read every file referenced before answering. List options. Cite trade-offs. Ask one clarifying question before proposing. |

## Phase 2: Persist the flag

Write the level to `.claude/active.md` (which is gitignored — per-developer state) under a `## Think level` heading. Append-or-replace, don't overwrite the whole file. Example:

```markdown
## Think level
high — set 2026-05-27 14:32 — applies to next non-trivial response
```

If `.claude/active.md` doesn't exist yet, create it.

## Phase 3: Confirm

Print one line:

```
Think level set: <level> — applies to your next non-trivial request
```

## Phase 4: How agents should honor this flag

When any agent in the studio is about to draft a response, it should check `.claude/active.md` for an active `## Think level`. If `high`, the agent should:

- Read every referenced file in full.
- List 2–4 options with explicit trade-offs.
- Ask one clarifying question before proposing a path.
- Tag the response with `[think:high]` at the top so the user can confirm the flag was honored.

After the next non-trivial response, the agent clears the flag (writes `low` to `active.md`). Think level is one-shot, not sticky — re-set it when you want the next response to think harder again.

## Do not

- Don't change the model. This is a behavior flag, not a model selector.
- Don't apply `high` to trivial requests (status checks, file listings) — defer the flag to the next substantive question.
