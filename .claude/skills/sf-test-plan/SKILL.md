---
name: sf-test-plan
description: "Plan unit, component, integration, and UAT tests for a story or feature, before any test code is written."
argument-hint: "[story-file-or-feature-description]"
user-invocable: true
allowed-tools: Read, Glob, Write, AskUserQuestion
model: sonnet
agent: qa-lead
---

## Phase 1: Read the story or feature description

If a story file path is provided, read it. Otherwise, ask the user for the feature scope.

## Phase 2: Enumerate scenarios

For each acceptance criterion, draft test scenarios in this matrix:

| Layer       | Scenario                              | Type       |
|-------------|---------------------------------------|------------|
| Apex unit   | Happy path — single record            | Positive   |
| Apex unit   | Happy path — 200 records (bulk)       | Positive   |
| Apex unit   | Invalid input rejected                | Negative   |
| Apex unit   | Permission denied for low-priv user   | Negative   |
| Apex unit   | Edge: empty list                      | Edge       |
| Apex unit   | Edge: null field                      | Edge       |
| Integration | Trigger fires across object update    | Integration|
| LWC Jest    | Component renders with valid props    | Positive   |
| LWC Jest    | Component handles wire error          | Negative   |
| LWC Jest    | Click → Apex method called            | Behavior   |
| UAT         | End-to-end manual scenario per persona | Manual    |

## Phase 3: Identify test data

What records, what users, what permission sets are required? Will `TestDataFactory` need new methods?

## Phase 4: Identify mocks

Any callouts? Then list the `HttpCalloutMock` classes needed.

## Phase 5: Output

Write the plan as a markdown file at `docs/test-plans/<story-id>.md`. Don't write any test code in this skill — that's `/sf-apex-test-write` or hand-authored Jest.

Always confirm with the user: "Plan ready — should I scaffold the test classes via `/sf-apex-test-write`?"
