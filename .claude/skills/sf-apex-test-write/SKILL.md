---
name: sf-apex-test-write
description: "Scaffold an Apex test class with bulk + positive + negative + permission scenarios. Uses TestDataFactory if present; otherwise generates one."
argument-hint: "<class-or-trigger-under-test>"
user-invocable: true
allowed-tools: Read, Glob, Write, Edit, AskUserQuestion
model: sonnet
agent: qa-lead
---

## Phase 1: Read the target

Read the class or trigger under test. Identify:
- Public/global methods (test entry points).
- SObjects touched (test data needed).
- Sharing declaration (run-as scenarios).
- External dependencies (callouts → mock).

## Phase 2: Read or scaffold TestDataFactory

If `TestDataFactory.cls` exists, read it. Otherwise, propose creating one and ask before writing.

## Phase 3: Read the rules

Load `.claude/rules/apex-tests.md`. Every test must conform.

## Phase 4: Draft the test class structure

Show the user the structure before writing:

```
@isTest
private class <Target>Test {

    @TestSetup
    static void setup() { /* TestDataFactory.create... */ }

    @isTest
    static void <method>_happy_path_single_record() { ... }

    @isTest
    static void <method>_handles_200_records_in_bulk() { ... }

    @isTest
    static void <method>_rejects_invalid_input() { ... }

    @isTest
    static void <method>_respects_sharing_for_low_priv_user() { ... }
}
```

Confirm method list with the user.

## Phase 5: Write the file

Write to `force-app/main/default/classes/<Target>Test.cls` and `<Target>Test.cls-meta.xml`.

Each test method must:
- Use `Test.startTest()` / `Test.stopTest()` around the system under test.
- Have at least one `Assert.areEqual` / `Assert.isTrue` / `Assert.fail` that proves behavior.
- Not use `SeeAllData=true`.
- Not contain hardcoded record IDs.
- For bulk tests, build collections of 200 records via the factory.

## Phase 6: Suggest running

Offer: `sf apex run test --class-names <Target>Test --result-format human --code-coverage` — ask first.
