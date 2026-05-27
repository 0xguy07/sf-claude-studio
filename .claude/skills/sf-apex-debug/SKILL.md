---
name: sf-apex-debug
description: "Diagnose an Apex production issue: pull a debug log, decode the exception, identify the limit hit or root cause, and propose a fix."
argument-hint: "[--log-id <id>] [--user <username-or-alias>] [--target-org <alias>]"
user-invocable: true
allowed-tools: Read, Glob, Grep, Bash, AskUserQuestion
model: sonnet
agent: apex-debugger
---

## Phase 1: Get evidence

Ask the user for one of:
- A specific log id (`sf apex list log` then `sf apex get log --log-id <id>`).
- A username + time window (we'll list recent logs and pick).
- A pasted stack trace or exception message.
- A failing test class name.

Don't proceed without artifacts. Speculation is the wrong tool.

## Phase 2: Set debug levels (if needed)

If logs are stale or absent, recommend:

```
sf apex list log --target-org <alias>     # see existing logs
# or set fresh debug levels:
sf data create record --sobject TraceFlag --values "TracedEntityId=005... DebugLevelId=... ExpirationDate=$(date -v +30M -u +%FT%TZ)"
```

(or via the UI — Setup → Debug Logs → New)

## Phase 3: Read the log

Pull the log:

```
sf apex get log --log-id <id> --target-org <alias>
```

Parse for:
- `EXCEPTION_THROWN` and `FATAL_ERROR` lines (the headline).
- `LIMIT_USAGE_FOR_NS` block (which limit was approached/exceeded).
- `SOQL_EXECUTE_BEGIN` / `_END` count.
- `DML_BEGIN` / `_END` count and target objects.
- `CODE_UNIT_STARTED` chain (the call stack).

## Phase 4: Diagnose

Common patterns and their fixes:

| Symptom | Likely cause | Fix path |
|---|---|---|
| `Too many SOQL queries: 101` | SOQL in a trigger loop, or trigger recursion | `apex-classes.md` SOQL-in-loop; recursion guard |
| `CPU time limit exceeded` | Nested loops over large collections, complex Apex inside Flow | Algorithmic fix; offload to async; bulkify |
| `UNABLE_TO_LOCK_ROW` | Concurrent updates to same parent | Sequence DML; FOR UPDATE; redesign locking |
| `LimitException: Apex heap size too large` | Large query result loaded into a List | SOQL `for` loop; chunk the work |
| `System.NullPointerException` at `Trigger.newMap` | Trigger handler not bulk-aware on update | Bulkification audit |
| `INVALID_CROSS_REFERENCE_KEY` | Hardcoded record-type id or invalid lookup | `apex-classes.md` no-hardcoded-IDs |

## Phase 5: Propose fix

For each finding, propose:
- A file:line where the fix goes.
- A diff or pseudo-code.
- A test scenario that would catch a regression.

Hand off to `apex-lead` for the actual code change.

## Phase 6: Document

If this was a real incident, suggest writing a short post-mortem to `docs/incidents/<date>-<short-name>.md` covering: timeline, root cause, fix, prevention.
