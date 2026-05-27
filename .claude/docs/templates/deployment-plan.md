# Deployment Plan: {{Release Name}}

**Date / window:** {{YYYY-MM-DD HH:MM-HH:MM TZ}}
**Target org:** {{alias / production}}
**Deploy lead:** {{name}}
**On-call:** {{name}}

## Pre-deploy

- [ ] Solution-design and ADRs current
- [ ] All stories Done
- [ ] `sf project deploy validate` passed: {{deploy ID + timestamp}}
- [ ] Test level: {{RunSpecifiedTests / RunLocalTests}} — never NoTestRun
- [ ] Scanner / code-analyzer clean (no CRITICAL)
- [ ] Stakeholder comms sent: {{date}}
- [ ] User-facing change comms sent: {{date}}
- [ ] Sandbox refresh ordering checked

## Deploy steps (in order)

1. {{Pre-deploy data script — e.g., backfill new field}}
2. {{`sf project deploy start --target-org <alias> --test-level RunSpecifiedTests --tests …`}}
3. {{Permission set assignments}}
4. {{Post-deploy data script}}
5. {{Smoke test by deploy lead}}
6. {{Hand-off to QA for UAT smoke}}
7. {{Sign-off and stakeholder comms}}

## Rollback plan

**Trigger:** {{when to abort — e.g., "any P1 within 30 min of deploy"}}

1. {{Run destructiveChanges to remove new metadata}}
2. {{Restore data from backup `{{snapshot ID}}`}}
3. {{Reassign prior permission sets}}
4. {{Notify stakeholders of rollback}}

## Post-deploy verification

- [ ] Smoke test: {{specific actions}}
- [ ] Monitoring: {{dashboards / alerts to watch for first 24 h}}
- [ ] Apex error log review at T+1h, T+24h

## Sign-offs

| Role           | Name | Time     |
|----------------|------|----------|
| Solution arch  |      |          |
| Tech arch      |      |          |
| QA lead        |      |          |
| Security lead  |      |          |
| DevOps lead    |      |          |
| Business sponsor |    |          |
