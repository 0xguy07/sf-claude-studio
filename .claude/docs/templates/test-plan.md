# Test Plan: {{Story / Feature}}

**Owner:** {{name}}
**Story ID:** {{link}}

## Scope

{{One paragraph. What is being tested?}}

## Test layers

| Layer       | Tool         | Coverage target | Owner |
|-------------|--------------|-----------------|-------|
| Apex unit   | Apex `@isTest` | ≥ 75% on changed code, every branch | apex-lead |
| LWC unit    | Jest         | All public `@api` paths | lwc-lead |
| Integration | Apex `@isTest` with mocks | Happy + retry + failure | integration-lead |
| UI E2E      | Cypress / Playwright | Smoke per persona | qa-lead |
| UAT         | Manual       | All ACs                 | business owner |

## Scenarios

### Apex unit

- [ ] `<method>` — happy path single record
- [ ] `<method>` — bulk 200 records
- [ ] `<method>` — invalid input rejected
- [ ] `<method>` — permission denied via `System.runAs`
- [ ] `<method>` — empty list / null edge cases

### LWC Jest

- [ ] Renders with valid props
- [ ] Handles `@wire` error
- [ ] Click → Apex method called with expected args
- [ ] Empty / loading / error states render

### Integration

- [ ] Outbound callout success
- [ ] Outbound callout 5xx with retry
- [ ] Outbound callout 4xx without retry
- [ ] Inbound endpoint idempotency (replay-safe)
- [ ] Platform event consumer replay

### UAT scenarios

- [ ] {{Persona A — end-to-end happy path}}
- [ ] {{Persona B — permission edge case}}

## Test data

- {{What users / records / permission sets / orgs are required}}
- {{`TestDataFactory` methods needed (existing or to add)}}

## Mocks

- {{`HttpCalloutMock` classes by integration}}

## Exit criteria

- All scenarios pass.
- Coverage target met on changed code.
- No flaky tests in the regression run.
- UAT signed off.
