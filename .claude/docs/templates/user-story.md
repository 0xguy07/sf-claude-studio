# Story: {{Title}}

**Story ID:** {{ID}}
**Epic:** [{{Epic Title}}]({{epic-link}})
**Status:** Draft | Ready | In Progress | In Review | Done
**Estimate:** {{points or t-shirt}}
**Owner:** {{name}}

## User narrative

As a **{{persona}}**,
I want **{{capability}}**,
so that **{{outcome}}**.

## Acceptance criteria

- [ ] {{Specific, testable AC #1}}
- [ ] {{Specific, testable AC #2}}
- [ ] {{Specific, testable AC #3}}

## Out of scope

- {{Explicitly not in this story}}

## Dependencies

- Blocks: {{story-id}}
- Blocked by: {{story-id}}
- Related ADR: {{adr-link}}

## Implementation notes

{{Architecture sketch / data model changes / sharing implications.
Filled in by the technical-architect or apex-lead during refinement, not at story creation.}}

## Test scenarios

(See `/sf-test-plan` for full matrix. Headline scenarios here.)

- {{Scenario 1}}
- {{Scenario 2}}

## Definition of Done

- [ ] Code merged to release branch
- [ ] `/sf-code-review` BLOCKING findings: 0
- [ ] `/sf-security-review` CRITICAL findings: 0
- [ ] Apex coverage on changed code ≥ 75%
- [ ] Jest tests for new LWC components
- [ ] Permission set updated (if applicable)
- [ ] Release notes entry drafted
- [ ] Deployed to UAT and validated
