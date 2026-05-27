---
paths:
  - "force-app/**/lwc/**"
  - "src/lwc/**"
---

# Lightning Web Component Rules

## Lightning Web Security (LWS)

LWS is the default isolation layer for new orgs (replaces Locker Service). Every component runs in a sandboxed JS realm that intercepts and namespaces global-object access. Concretely this means:

- `window`, `document`, `setTimeout`, etc. are wrapped — most direct calls work, some don't.
- The `template.querySelector` boundary is enforced (you cannot reach into another component's shadow DOM).
- Some third-party libraries that walk the global object will not work without adaptation.
- The DX MCP `guide_lwc_security` tool reviews components against current LWS rules — use it.

If the component runs in a legacy Locker Service org, treat the older Locker docs as an additional constraint, but design for LWS.

## SLDS2

New components target **SLDS2** (Salesforce Lightning Design System 2). The design tokens, density modes, and dark-mode support differ from SLDS1. The DX MCP `orchestrate_lwc_slds2_uplift` tool migrates older components.

## Mandatory

- **Every component has a Jest test.** No `*.js` ships without a `__tests__/*.test.js`.
- **Don't return manually-serialized JSON from Apex.** Return SObjects or Apex DTOs; the framework serializes correctly and cheaply. *[SFB #12]*
- **Prefer wire service / Lightning Data Service** over imperative Apex for reads. Imperative only when LDS doesn't fit (transactional writes, complex aggregation, callouts).
- **Use `template.querySelector`** — never `document.querySelector`. The latter breaks the shadow boundary and the Lightning Locker model.
- **No PII in `console.log`.** Logs end up in browser dev tools and are not protected.
- **Sanitize URL params** before rendering. Never `innerHTML` from a URL string.
- **No `eval`, no `Function()` constructor.**

## Strongly Recommended

- **Single-purpose components.** A component renders OR fetches OR routes — not all three. Compose larger pages from small components.
- **`@api` is a contract.** Treat changes to `@api` properties as breaking changes. Document them.
- **SLDS design tokens** for colors, spacing, typography. Avoid raw hex / px in `*.css`.
- **Accessibility — WCAG 2.1 AA.** Roles, labels, keyboard navigation, focus management.
- **Cacheable Apex methods** for read-only fetches (`@AuraEnabled(cacheable=true)`).
- **No business logic in `renderedCallback`** beyond focus / scroll positioning. Heavy work in `connectedCallback` or wires.

## Examples

**Correct** — wire service, cacheable Apex, real assertions:

```js
// accountSummary.js
import { LightningElement, api, wire } from 'lwc';
import getSummary from '@salesforce/apex/AccountSummaryController.getSummary';

export default class AccountSummary extends LightningElement {
    @api recordId;
    @wire(getSummary, { accountId: '$recordId' }) summary;
}
```

```apex
public with sharing class AccountSummaryController {
    @AuraEnabled(cacheable=true)
    public static AccountSummaryDTO getSummary(Id accountId) { ... }
}
```

**Incorrect** — imperative Apex returning JSON string, leaks PII, manipulates DOM directly:

```js
import getSummaryJson from '@salesforce/apex/Ctrl.getSummaryJson';

connectedCallback() {
    getSummaryJson({ id: this.recordId }).then(json => {
        const data = JSON.parse(json);                      // VIOLATION: manual JSON
        console.log('user', data.email);                    // VIOLATION: PII in log
        document.querySelector('#name').innerText = data.name; // VIOLATION: bypasses shadow DOM
    });
}
```
