---
name: sf-trace
description: "Toggle verbose tool-call logging for the current session. When on, the studio narrates every tool call before running it: which file is being read, which sf command is about to run, which agent is being spawned."
argument-hint: "[on | off]"
user-invocable: true
allowed-tools: Write, Read
model: haiku
---

Session control. The user wants to see what the studio is doing under the hood — useful when behavior seems wrong, or when teaching someone how the studio works.

## Phase 1: Parse the argument

Accept `on`, `off`, or no argument (toggles current state).

## Phase 2: Persist the flag

Write the state to `.claude/active.md` under `## Trace`. Same file as `/sf-think` uses; append-or-replace. Example:

```markdown
## Trace
on — set 2026-05-27 14:35
```

## Phase 3: Confirm

Print one line:

```
Trace ON  — every tool call will be narrated before it runs
Trace OFF — back to silent tool execution
```

## Phase 4: How the studio should honor this flag

When trace is on, before every tool call, output a one-line `[trace] <verb> <target>` line:

```
[trace] read .claude/rules/apex-classes.md
[trace] glob force-app/main/default/classes/*.cls
[trace] bash sf data query --query "SELECT Id FROM Account LIMIT 5"
[trace] task spawn apex-lead with diff of 3 files
```

Keep it terse — one line per call, no JSON, no parameter dumps. Surface enough that the user can audit the call without drowning in detail.

## Do not

- Don't dump full tool parameters in trace lines (they get noisy fast).
- Don't toggle other session flags (think, etc.).
- Don't treat trace as a security feature — it's an observability nicety. If the user denies a tool call mid-session, the harness handles that, not this skill.
