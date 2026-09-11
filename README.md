# PermitPulse

**CALL-E hackathon build:** one approved phone status call turns a permit-office queue into a structured project next step.

## Why this exists

Contractors, architects, and project coordinators repeatedly call permit offices to answer basic but schedule-critical questions: Was the permit received? Is it still in review? Is a correction missing? Is an inspection ready to schedule? Which department owns the next step?

PermitPulse uses CALL-E for that bounded phone work, then returns a machine-readable permit status receipt. It deliberately does **not** impersonate government, make code-compliance claims, pay fees, submit documents, or autonomously schedule/cancel inspections.

## Product flow

1. Enter the permit, project, jurisdiction, and authorized office number.
2. Review three live-call gates: contact authorization, AI disclosure, and fresh intent.
3. CALL-E places one purpose-bounded status call.
4. CALL-E extracts permit status, missing items, inspection status, next available date (if volunteered), department/contact, and next action.
5. The UI renders a project handoff with evidence for human review.

## CALL-E integration

The server calls `POST /v1/calls` with a content-derived idempotency key and a closed recipient result schema, then polls `GET /v1/calls/{id}`. The API key stays server-side.

## Local run

```bash
cp .env.example .env.local
# add CALLE_API_KEY for live mode
npm install
npm run dev
```

Without `CALLE_API_KEY`, the app remains fully inspectable in clearly labeled synthetic demo mode. Live mode is disabled rather than silently simulated.

## Hackathon positioning

Target category: **Most Practical Use Case**. Permit and inspection status is a phone-native operational bottleneck in many jurisdictions where online portals lag the actual review queue or do not expose the reason a case is stuck.

## Safety boundary

- explicit authorization before dialing
- mandatory AI disclosure; never claims to be a government official
- one fresh intent gate per call
- E.164 validation
- deterministic idempotency key
- no legal/code-compliance claims
- no fee payment or credentials
- no document submission or autonomous booking
- unknown beats guessing
- human owns every downstream project decision

## License

Proprietary. All rights reserved. The small upstream CALL-E contribution required for hackathon submission will be isolated from this application and contributed under the upstream repository's terms.
