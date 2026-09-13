# PermitPulse — CALL-E Hackathon Submission

## One-line pitch
PermitPulse turns a slow permit-status phone chase into one disclosed AI call and a structured, human-actionable project handoff.

## Problem
Contractors and project coordinators regularly lose time calling permitting/building offices just to learn whether a permit was received, is still under review, needs corrections, or is ready for inspection scheduling. The problem is not merely getting a status string; it is converting a phone-only update into a safe next step for an active project without letting the caller make commitments on the team's behalf.

## Solution
PermitPulse uses CALL-E to place one authorized outbound call to the relevant permit office and returns a structured operational handoff instead of a transcript-only blob.

It captures:
- current permit status
- missing corrections or documents
- inspection readiness
- any date volunteered by the office
- department/contact information
- the smallest safe next action for the project team

The UI then turns that structured result into a project status card for human review. A `schedule_inspection` next action is a recommendation to the human project team, never permission for the agent to book anything.

## What differentiates PermitPulse
Permit-status calling is an obvious CALL-E use case, so PermitPulse is deliberately not positioned as merely “an AI that asks the city for status.” Its contribution is the controlled handoff around the call:

1. **Three explicit live-call gates** — contact authorization, AI-disclosure approval, and fresh live-call intent are all required before dispatch.
2. **Field-trial isolation** — hackathon live testing can be routed to one explicitly consenting test number without ever dialing the synthetic permit-office fixture.
3. **Content-bound idempotency** — retries of the same authorized case map to the same call identity rather than silently creating another call.
4. **Closed structured result contract** — permit state, inspection state, missing items, volunteered date, contact and next action are returned as a machine-readable handoff rather than inferred later from free prose.
5. **Human-owned downstream action** — the phone agent cannot pay, submit, book, cancel, make legal/code-compliance claims or commit the project team to an action.
6. **Product workflow, not a CLI-only demo** — the Next.js experience exposes preflight, dispatch/status reconciliation, evidence and the resulting project handoff in one operator flow.

## Safety boundary
PermitPulse never impersonates a government official, gives legal or code-compliance advice, pays fees, submits documents, schedules or cancels an inspection, or makes commitments. Ambiguous facts are returned as unknown.

## Technical implementation
The app is a Next.js web application with a server-side CALL-E integration. Live mode creates a CALL-E call task with a strict recipient result schema, uses a deterministic idempotency key, keeps credentials server-side, and exposes a read-only status route for result reconciliation.

A separate field-trial override can route hackathon testing only to an explicitly consenting test number without ever dialing the synthetic permit-office fixture. Provider error payloads are not reflected wholesale to the browser; the API exposes only the bounded error needed by the operator.

## Why CALL-E matters
This is not a generic chatbot or a scripted form. The product needs a real phone conversation because permit status often lives behind office phone trees, staff handoffs, and human explanations that are not reliably exposed by public APIs.

CALL-E is used at runtime to make the outbound call and return structured evidence that the UI turns into an operational next-step card.

## Community contribution
The reusable `permit-status-check` Agent Skill is prepared against CALL-E's `awesome-phone-call-agents` repository with:
- English-only skill documentation
- dry-run preview
- synthetic fixture
- safety reference
- examples
- repository validator-compatible structure

The upstream contribution is intentionally smaller than PermitPulse itself: it captures the reusable safe-call pattern, while the product repository contains the complete operator UI and project handoff workflow.

## Built during the hackathon
PermitPulse, the permit-specific result schema, safe live-call gates, field-trial routing, tests, UI, and reusable CALL-E skill were created for this hackathon entry.

## Public judge demo
Interactive judge demo: https://keen-insight-pn5ef25.shipstatic.com

The hosted judge demo is deliberately synthetic and labeled as such. It lets judges inspect the operator flow and structured receipt without credentials or live-call side effects. The production code path uses CALL-E server-side at runtime.

## Upstream PR transport blocker
GitHub is currently refusing this entrant account's fork request with HTTP 403 (`You cannot fork this repository at this time`). The validated contribution is public at https://github.com/am-selenephos/permit-status-check-skill and the exact patch is stored at `upstream/permit-status-check.patch`. The blocker is documented upstream in https://github.com/CALLE-AI/awesome-phone-call-agents/issues/475 and has also been escalated to the hackathon support address before the submission deadline.

## Target prize
Most Practical Use Case.
