---
paths:
  - "force-app/**/classes/**/*Test.cls"
  - "force-app/**/classes/**/*_Test.cls"
  - "force-app/**/classes/**/Test_*.cls"
  - "src/classes/**/*Test.cls"
---

# Apex Test Class Rules

Sources cited as in `apex-classes.md`.

## Mandatory

- **Tests in a separate `@isTest` class.** Don't intermix test methods with production code. *[SF-DPC 2.1.11]*
- **No `@isTest(SeeAllData=true)`.** Generate test data inside the test (or in `@TestSetup`). The only documented exception is Content/Knowledge testing — must be commented and approved. *[SF-DPC 2.1.11]*
- **`Test.startTest()` / `Test.stopTest()`** wrap the code under test, giving it a fresh governor-limit budget separate from setup. *[SF-DPC 2.1.11, SF-WIKI #9]*
- **Bulk testing** — every trigger/service test must include a 200-record case to prove governor-limit safety. *[SF-WIKI #1, SF-WIKI #9, SFB #1]*
- **Positive and negative assertions.** Don't only test the happy path; assert that invalid inputs are rejected. *[SF-DPC 2.1.11]*
- **Test under different users / profiles** with `System.runAs` whenever sharing or FLS matters. *[SF-DPC 2.1.11]*
- **Meaningful assertions.** Every test method has at least one `Assert.areEqual`/`Assert.isTrue` that proves behavior — not "no exception thrown." *[SFB #8]*
- **No hardcoded IDs in tests.** Same rule as production code. *[SF-WIKI #10, SFB #3]*

## Strongly Recommended

- **Test data factory.** All test data flows through a `TestDataFactory` (or equivalent) — never copy-paste setup. *[SF-DPC 2.1.11]*
- **`@TestSetup`** for fixtures shared across multiple test methods.
- **Coverage is a floor, not a goal.** 75% is the platform minimum; the bar is "every branch covered with assertions."
- **Mock callouts** with `Test.setMock` and an `HttpCalloutMock` per integration. *[SF-DPC 2.5.1]*

## Code smells

- **`Test.isRunningTest()` in production code is a smell.** It usually means the class is branching on environment instead of mocking a dependency. Common fixes: extract the dependency behind an interface and inject a mock implementation in tests; use `@TestVisible` to expose a setter; use a stub-API mock (`Test.createStub`). Branching on `isRunningTest()` ships test-only paths to production and is hard to audit.
- **Tests that only assert "no exception thrown."** Coverage without an `Assert.areEqual`/`Assert.isTrue` proves nothing. Every test must prove behavior with at least one real assertion.

## Examples

**Correct** — separate class, bulk + negative + permission tests, factory, real assertions:

```apex
@isTest
private class AccountTriggerHandlerTest {

    @TestSetup
    static void setup() {
        TestDataFactory.createAccounts(5);
    }

    @isTest
    static void rollup_runs_in_bulk() {
        List<Account> accounts = TestDataFactory.createAccounts(200);

        Test.startTest();
        insert TestDataFactory.createOpportunitiesFor(accounts, 1);
        Test.stopTest();

        for (Account a : [SELECT Won_Amount__c FROM Account WHERE Id IN :accounts]) {
            Assert.areEqual(0, a.Won_Amount__c, 'No opps won yet');
        }
    }

    @isTest
    static void rollup_respects_sharing() {
        User readOnly = TestDataFactory.createUser('Read Only');
        System.runAs(readOnly) {
            try {
                Test.startTest();
                AccountRollupService.rollupOpportunityAmounts(new Set<Id>{ ... });
                Test.stopTest();
                Assert.fail('Expected exception');
            } catch (System.NoAccessException e) {
                Assert.isTrue(e.getMessage().contains('Insufficient'));
            }
        }
    }
}
```

**Incorrect** — `SeeAllData`, single-record only, no real assertions:

```apex
@isTest(SeeAllData=true)                                        // VIOLATION
private class AccountTriggerHandlerTest {
    @isTest
    static void it_works() {
        Account a = [SELECT Id FROM Account LIMIT 1];           // VIOLATION: org data
        update a;
        System.assert(true);                                    // VIOLATION: no real assertion
    }
}
```
