---
name: sf-help
description: "Lists all available skills, agents, hooks, and rules in this template."
user-invocable: true
allowed-tools: Read, Glob, Bash
model: haiku
---

Read the contents of:

- `.claude/agents/` — print one line per agent with the `description:` from frontmatter.
- `.claude/skills/*/SKILL.md` — print one line per skill with the `description:`.
- `.claude/rules/` — print the filename and the path glob each rule is scoped to.
- `.claude/hooks/` — print the script name and a one-line summary from the comment header.

Group by section, output as a Markdown list. Keep it terse — one line per entry. End with a "Tip: type `/sf-start` if you're new here" line.
