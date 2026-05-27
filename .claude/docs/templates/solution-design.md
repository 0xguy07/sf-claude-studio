# Solution Design: {{Initiative}}

**Author:** {{name}}
**Date:** {{YYYY-MM-DD}}
**Status:** Draft | In Review | Approved | Superseded

## 1. Business problem

{{One paragraph. What is the user trying to do? Why does it matter? What's the cost of not doing it?}}

## 2. Stakeholders

| Role             | Name | Approval needed |
|------------------|------|-----------------|
| Business sponsor |      | yes             |
| Solution arch    |      | yes             |
| Tech arch        |      | yes             |
| Security         |      | yes             |
| Data owner       |      | maybe           |

## 3. Constraints

- License / edition: {{e.g., Enterprise + Service Cloud}}
- Volume: {{records / day, peak users, integration TPS}}
- Regulatory: {{HIPAA / SOC2 / GDPR / none}}
- Deadline: {{date and source}}
- Existing investments to respect: {{e.g., MuleSoft, existing trigger framework}}

## 4. Options considered

### Option A: {{Declarative — Flow + Validation Rules}}
- Pros: …
- Cons: …
- Cost (effort + license + future maintenance): …

### Option B: {{Apex service + Trigger handler}}
- Pros: …
- Cons: …
- Cost: …

### Option C: {{Integration via Platform Events}}
- Pros: …
- Cons: …
- Cost: …

## 5. Recommended option

{{Letter and one-paragraph justification. Why is this the right trade-off given the constraints in §3?}}

## 6. Data model

{{ERD or text. New objects, new fields, relationships, key flags (External Id, indexed, FLS-sensitive).}}

## 7. Sharing model

- OWD: {{per object}}
- Role-hierarchy: {{yes/no, why}}
- Sharing rules: {{list}}
- Apex sharing: {{if needed, why}}

## 8. Integrations

{{Inbound + outbound. For each: protocol, auth, idempotency strategy, retry policy, rate limit, partner SLA.}}

## 9. Limits feasibility

{{Per-transaction governor budget. SOQL count, DML count, callout count, heap, CPU. API call volume per day.}}

## 10. Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
|      | low/med/hi | low/med/hi | … |

## 11. Open questions

- [ ] {{Question 1}}
- [ ] {{Question 2}}

## 12. Decision log

(Append-only. Date, decision, who approved.)
