# Runbook: {{Service / Job / Integration}}

**Owner:** {{team / name}}
**Last updated:** {{YYYY-MM-DD}}

## What this is

{{One paragraph. What does this service do? Who depends on it?}}

## Where it lives

- Apex: {{class names / paths}}
- LWC: {{components}}
- Schedule: {{job name + cron}}
- Integration: {{named credential / endpoint}}

## Healthy signals

- {{Dashboard / metric}}
- {{Expected throughput / SLA}}

## Common alerts

### Alert: {{Name}}
- **What it means:** …
- **First check:** {{query / debug log}}
- **Likely cause:** {{...}}
- **Fix:** {{steps, including any commands}}
- **Escalate to:** {{role / name}}

## Manual interventions

### {{Run X}}
```
sf apex run --file scripts/apex/{{x}}.apex --target-org <alias>
```

### {{Pause Y}}
{{Steps and reversal.}}

## Known issues / quirks

- {{The "if it does X, that's normal" list}}

## Escalation

| Level | Who | When |
|-------|-----|------|
| L1    |     |      |
| L2    |     |      |
| L3    |     |      |
