---
paths:
  - "force-app/**/flows/**/*.flow-meta.xml"
  - "src/flows/**/*.flow-meta.xml"
---

# Flow Rules

## Mandatory

- **Fault paths required.** Every Get Records, Create Records, Update Records, Delete Records, and Action element has a fault path that does something meaningful (assign error message, log, send email — never silent swallow).
- **No hardcoded IDs.** Reference record types via DeveloperName, custom labels, or custom metadata.
- **One automation per object per use case** — don't build five overlapping record-triggered flows on the same SObject. Combine them.
- **API version current.** Pin the flow to the latest API version unless a documented reason exists.
- **Description filled in.** Every flow's `<description>` element states the business purpose.
- **Before-Save flows for same-record updates.** When the only goal is to set fields on the record that triggered the flow, use a Before-Save record-triggered flow — it skips re-saving the record and runs ~10x faster than After-Save. After-Save is for cross-record work (related-record updates, child creation, callouts).
- **Decision-first design.** Branch as early as possible. Don't do work and then decide whether to keep it; decide first, then do work in the matching branch. Reduces wasted SOQL/DML on rows that won't be used.
- **Avoid Flow → Apex → Flow recursion.** A flow that invokes Apex which fires a trigger which runs another flow is a top-cause of "too many SOQL queries" in production. Document any cross-layer call explicitly.
- **Run the Flow Scanner.** The Code Analyzer v5 Flow Scanner engine catches a large class of these issues automatically. Run it on every flow change (`/sf-flow-review` or `sf code-analyzer run --target force-app/**/flows`).

## Strongly Recommended

- **Naming convention** — `{Object}_{Trigger}_{Purpose}` for record-triggered, e.g., `Account_AfterInsert_AssignTerritory`.
- **Subflow extraction** when the same logic appears in 2+ flows.
- **Bulk-aware** — when iterating, prefer collection operations over loops + DML.
- **Avoid SOQL inside loops.** Get Records before the loop; loop over the collection.
- **Document the design** — when a flow becomes complex, add a process-design doc in `docs/processes/`.

## Examples

**Correct** (excerpt):

```xml
<recordLookups>
    <name>Get_Account</name>
    <faultConnector><targetReference>Log_Error</targetReference></faultConnector>
    <object>Account</object>
    <filters>
        <field>Id</field>
        <operator>EqualTo</operator>
        <value><elementReference>recordId</elementReference></value>
    </filters>
</recordLookups>
```

**Incorrect**:

```xml
<recordLookups>
    <name>Get_Account</name>
    <!-- VIOLATION: no fault path -->
    <object>Account</object>
    <filters>
        <field>RecordTypeId</field>
        <operator>EqualTo</operator>
        <value><stringValue>0125g000000abcd</stringValue></value>  <!-- VIOLATION: hardcoded Id -->
    </filters>
</recordLookups>
```
