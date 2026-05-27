---
paths:
  - "force-app/**/classes/**/*.cls"
  - "src/classes/**/*.cls"
---

# Apex Class Rules

These rules encode the canonical Apex best practices from:

- **[SF-DPC]** Salesforce Engineering — Developer Practices Checklist (2015)
- **[SF-WIKI]** Salesforce Developer Wiki — Apex Code Best Practices (10 rules)
- **[SFB]** SalesforceBen — 12 Salesforce Apex Best Practices

The bracketed citations in each rule indicate the source.

## Governor limits to design against

Per-transaction unless noted. Memorize these — they're the budget every Apex class spends.

| Limit | Sync | Async |
|---|---|---|
| SOQL queries | 100 | 200 |
| SOQL rows returned | 50,000 | 50,000 |
| DML statements | 150 | 150 |
| DML rows | 10,000 | 10,000 |
| Heap size | 6 MB | 12 MB |
| CPU time | 10,000 ms | 60,000 ms |
| HTTP callouts | 100 | 100 |
| Total callout time | 120 s | 120 s |

Use `Limits.getQueries()` / `Limits.getLimitQueries()` (and equivalents per limit) when a code path may approach a ceiling, and bail with a clear error before exceeding.

## Mandatory

- **Sharing must be declared explicitly** — every Apex class declares `with sharing`, `without sharing`, or `inherited sharing`. `without sharing` requires a comment explaining why. *[SF-DPC 2.1.1, SFB #4]*
- **Bulkify everything** — code must process collections (1–200 records in triggers, more elsewhere) without loss of correctness. Never assume a single record. *[SF-WIKI #1, SFB #1]*
- **No SOQL or DML inside `for` loops** — query and DML once, in bulk, outside the loop. *[SF-DPC 2.1.8, SF-WIKI #2, SFB #2]*
- **No hardcoded record IDs** — query record types and reference data at runtime; cache in maps. Use DeveloperName lookups for record types and store any ID-like configuration in Custom Metadata. *[SF-WIKI #10, SFB #3]*
- **Helper methods accept collections** — never write a helper that takes a single record and is called inside a loop. *[SF-WIKI #3]*
- **Use `Limits` checks on hot paths** — for code paths that approach governor limits, use `Limits.getQueries() / Limits.getLimitQueries()` (and equivalents) and bail with a clear error before exceeding. *[SF-WIKI #7]*
- **`@future` discipline** — pass only primitives or collections of primitives; don't call `@future` inside a loop; respect the 10-per-invocation cap. Prefer queueable for richer payloads. *[SF-WIKI #8]*
- **Don't return manual JSON to LWC** — return SObjects or strongly-typed Apex objects; let the framework serialize. *[SFB #12]*
- **Bind variables in dynamic SOQL** — never concatenate user input into SOQL. Use bind variables, or `String.escapeSingleQuotes` plus an allowlisted field list when fully dynamic. *[SF-DPC 2.2.2]*
- **API version current** — keep classes at the most recent API version unless a documented reason exists. *[SF-DPC 2.1.7]*
- **Enforce sharing/CRUD/FLS on data access.** Use modern syntax (Spring '23+):
  - SOQL: `[SELECT ... FROM Account WITH USER_MODE]` — replaces the older `WITH SECURITY_ENFORCED`.
  - DML: `Database.insert(records, AccessLevel.USER_MODE)` (and `update`/`upsert`/`delete` equivalents) — replaces hand-rolled `Schema.DescribeFieldResult.isCreateable()` boilerplate.
  - Pre-write filtering: `Security.stripInaccessible(AccessType.CREATABLE, records)` when partially-trusted input may include fields the user can't write.
  - Older `WITH SECURITY_ENFORCED` and `Schema.DescribeFieldResult.is*()` are still valid but deprecated for new code. *[Salesforce Secure Coding]*

## Strongly Recommended

- Methods stay under ~45 lines (excluding data declarations). *[SF-DPC 2.1.5]*
- Constants in `final static` fields or Custom Metadata, not literals scattered through code. *[SF-DPC 2.1.3]*
- Inner classes used to keep related logic colocated. *[SF-DPC 2.1.2]*
- Custom exception classes when an error needs to be caught distinctly. *[SF-DPC 2.1.10]*
- Use SOQL `for` loops when the result set may exceed heap. *[SF-WIKI #6, SFB #6]*
- Modularize repeated logic into utility classes. Three copies = extract. *[SFB #7]*
- Avoid nested loops; abstract inner logic into a helper. *[SFB #9]*

## Examples

**Correct** — bulkified, no SOQL in loop, sharing declared, no hardcoded IDs:

```apex
public with sharing class AccountRollupService {
    public static void rollupOpportunityAmounts(Set<Id> accountIds) {
        Map<Id, Decimal> totals = new Map<Id, Decimal>();
        for (AggregateResult ar : [
            SELECT AccountId, SUM(Amount) total
            FROM Opportunity
            WHERE AccountId IN :accountIds AND IsWon = true
            GROUP BY AccountId
        ]) {
            totals.put((Id) ar.get('AccountId'), (Decimal) ar.get('total'));
        }

        List<Account> updates = new List<Account>();
        for (Account a : [SELECT Id FROM Account WHERE Id IN :accountIds]) {
            a.Won_Amount__c = totals.get(a.Id);
            updates.add(a);
        }
        update updates;
    }
}
```

**Incorrect** — implicit sharing, SOQL in loop, hardcoded ID:

```apex
public class AccountRollupService {                              // VIOLATION: sharing not declared
    public static void rollupOne(Id accountId) {                 // VIOLATION: not bulk-aware
        for (Opportunity o : [SELECT Id FROM Opportunity WHERE AccountId = :accountId]) {
            Account a = [SELECT Id FROM Account WHERE Id = :accountId]; // VIOLATION: SOQL in loop
            if (o.RecordTypeId == '0125g000000abcd') { /* ... */ }      // VIOLATION: hardcoded Id
        }
    }
}
```
