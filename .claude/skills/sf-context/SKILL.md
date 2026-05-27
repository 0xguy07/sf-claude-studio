---
name: sf-context
description: "Show what the studio has loaded into the current session: agents available, skills registered, rules currently in scope based on files touched, and rough token-budget estimate."
user-invocable: true
allowed-tools: Read, Glob, Bash
model: haiku
---

Tell the user what context is currently active. Useful when behavior seems off — the studio may have loaded a rule that's affecting suggestions, or may have *not* loaded one the user expected.

## Layout

```
── Loaded context ──

Agents available     14
  (list names, comma-separated)

Skills registered    27
  (list /sf-* names)

Rules in scope       3 of 10
  ✓ apex-classes      (force-app/main/default/classes/MyClass.cls touched this turn)
  ✓ apex-tests        (force-app/main/default/classes/MyClassTest.cls touched)
  ✓ flows             (force-app/main/default/flows/MyFlow.flow-meta.xml touched)
  · lwc-code          not in scope
  · aura-code         not in scope
  ...

Hooks active         7
  (list .sh names)

MCP                  enabled / disabled  (preset: <preset> if enabled)

Token estimate       ~<N>k of <budget>k
```

## How to gather each line

- **Agents**: `ls .claude/agents/*.md` — count and list names without the `.md` suffix.
- **Skills**: `ls -d .claude/skills/sf-*/` — count and list names.
- **Rules in scope**: read `.claude/rules/*.md` and extract the `paths:` glob. For each rule, check whether any file matching that glob has been read or written in the current conversation. Mark in-scope vs. not.
- **Hooks**: `ls .claude/hooks/*.sh` — count and list.
- **MCP**: check whether `.mcp.json` exists. If yes, parse the `--toolsets` arg and show which preset it matches (or "custom").
- **Token estimate**: rough heuristic — sum the file sizes of all markdown that's been injected this session (CLAUDE.md, AGENTS.md, STANDARDS.md, TOOLS.md, any rule files in scope, any agent definition spawned). Divide by 4 (rough chars-per-token). Round to nearest thousand. State it as an *estimate*, not a measurement — the actual count is opaque from inside the session.

## Do not

- Don't dump the full content of any rule, agent, or skill — just names.
- Don't try to compute exact token counts. State the estimate as approximate.
