---
name: sf-flow-review
description: "Review a flow for fault paths, hardcoded IDs, naming, API version, and bulk-aware design. Cites .claude/rules/flows.md."
argument-hint: "[flow-file-or-glob, default = staged flow changes]"
user-invocable: true
allowed-tools: Read, Glob, Grep, Bash, AskUserQuestion
model: sonnet
agent: flow-builder
---

## Phase 1: Targets

If the user provided a path, use it. Otherwise:

```
git diff --cached --name-only --diff-filter=AM | grep 'flow-meta.xml$'
```

## Phase 2: Read rules + flow XML

Load `.claude/rules/flows.md`. Read each flow file fully.

## Phase 3: Checklist

### BLOCKING

- [ ] **Fault paths** on every `<recordLookups>`, `<recordCreates>`, `<recordUpdates>`, `<recordDeletes>`, `<actionCalls>`.
- [ ] **No hardcoded SF Ids** in `<value><stringValue>` blocks (15- or 18-char alphanumerics).
- [ ] **`<description>` populated** at the flow level.

### WARNING

- [ ] Naming convention: `{Object}_{Trigger}_{Purpose}`.
- [ ] API version current.
- [ ] Single record-triggered flow per object per use case (warn if multiple flows on same object share trigger).
- [ ] Get Records before loops, not inside them.

### INFO

- [ ] Subflow extraction when logic repeats across flows.
- [ ] Process design doc exists for complex flows.

## Phase 4: Report + offer fixes

Standard severity-grouped report. Suggest specific XML edits in diff form.
