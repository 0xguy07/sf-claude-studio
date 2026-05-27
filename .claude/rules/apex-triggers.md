---
paths:
  - "force-app/**/triggers/**/*.trigger"
  - "src/triggers/**/*.trigger"
---

# Apex Trigger Rules

Sources cited as in `apex-classes.md`.

## Mandatory

- **One trigger per SObject.** Multiple triggers on the same object have undefined execution order and share the same governor budget. *[SF-DPC 2.3.2, SF-WIKI #5, SFB #5]*
- **No business logic in the trigger file.** The `.trigger` is a dispatcher only — it routes to a handler class. *[SF-DPC 2.3.1, SFB #11]*
- **Use a trigger handler framework.** Either fflib `TriggerHandler`, the Kevin O'Hara framework, or a project-local equivalent — but always one. *[SF-DPC 2.3.1]*
- **Cover all relevant trigger events** for the SObject, even if the body just calls `handler.handle()`. Keeps the dispatcher uniform. *[SF-DPC 2.3.3]*
- **Recursion guard.** Handlers must short-circuit on re-entry to prevent infinite loops from updates within update handlers. *[SF-DPC 2.3.4]*
- **No SOQL/DML in triggers** — those calls live in the handler's bulkified service methods. *[SF-WIKI #2, SFB #2]*
- **No hardcoded IDs** — same rule as classes. *[SF-WIKI #10, SFB #3]*

## Strongly Recommended

- Trigger filename: `{ObjectName}Trigger.trigger`. Handler: `{ObjectName}TriggerHandler.cls`. Service: `{ObjectName}Service.cls`.
- Handler methods named for the event: `beforeInsert`, `afterUpdate`, etc.
- Conditional logic on `Trigger.isBefore`/`isAfter` and `Trigger.isInsert`/`isUpdate`/`isDelete`/`isUndelete` should live in the dispatcher only when routing — not as branching business logic.

## Examples

**Correct** — single trigger, dispatcher only:

```apex
trigger AccountTrigger on Account (
    before insert, before update, before delete,
    after insert, after update, after delete, after undelete
) {
    new AccountTriggerHandler().run();
}
```

**Incorrect** — multiple triggers, business logic in trigger, hardcoded values:

```apex
// File: AccountValidation.trigger
trigger AccountValidation on Account (before insert, before update) {
    for (Account a : Trigger.new) {                                  // VIOLATION: logic in trigger
        if (a.RecordTypeId == '0125g000000xyz') {                    // VIOLATION: hardcoded Id
            Account dup = [SELECT Id FROM Account WHERE Name = :a.Name LIMIT 1]; // VIOLATION: SOQL in loop
            if (dup != null) a.Name.addError('Duplicate');
        }
    }
}

// File: AccountRollup.trigger    <-- VIOLATION: second trigger on same SObject
trigger AccountRollup on Account (after update) { /* ... */ }
```
