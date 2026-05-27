---
name: sf-soql-selectivity
description: "Review SOQL queries for selectivity at scale: indexed filters, anti-join patterns, LIKE wildcards, missing LIMITs."
argument-hint: "[file-or-glob]"
user-invocable: true
allowed-tools: Read, Glob, Grep, Bash, AskUserQuestion
model: sonnet
agent: data-lead
---

## Phase 1: Targets

User-supplied or all `*.cls`/`*.trigger` under `force-app/`.

## Phase 2: Extract every SOQL

Use grep + manual parsing. For each `[SELECT ... FROM ... WHERE ...]`:

- Identify the SObject queried.
- Identify every filter field.
- Identify every operator (`=`, `IN`, `LIKE`, `>`, `<`, etc.).

## Phase 3: Selectivity heuristics

For each query:

- [ ] **Has a `WHERE` clause** — required for any object expected to grow > 100k rows.
- [ ] **First filter is on a standard index** — Id, OwnerId, CreatedById, LastModifiedById, RecordTypeId, Name (if indexed), External Id (custom-marked), unique fields, foreign keys.
- [ ] **No leading `LIKE '%foo%'`** — disables index use.
- [ ] **No `NOT IN` on large sets** — anti-join is non-selective.
- [ ] **`LIMIT` set** when used outside aggregation.
- [ ] **No `SELECT *`** — Apex doesn't allow it, but watch for fields lists that pull large rich-text fields when not needed.

For each violation, recommend:
- Add a custom index (request via Salesforce Support / Big Objects strategy).
- Restructure filter (move selective predicate to first position).
- Use a skinny table or external store for read-heavy non-Salesforce-native data.

## Phase 4: Report

```
file.cls:LINE
  Query: SELECT ... FROM <Obj> WHERE <filters>
  Concern: <e.g., "leading filter on non-indexed field Email__c">
  Mitigation: <suggestion>
```

## Phase 5: Offer Query Plan run

If the user wants real numbers, suggest running the query in `sf data query` with the Developer Console Query Plan tool against an org with realistic volume.
