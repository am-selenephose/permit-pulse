# PermitPulse — CALL-E Hackathon Submission

## One-line pitch
PermitPulse turns a slow permit-status phone chase into one disclosed AI call and a structured, human-actionable permit status card.

## Problem
Contractors and project coordinators regularly lose time calling permitting/building offices just to learn whether a permit was received, is still under review, needs corrections, or is ready for inspection scheduling.

## Solution
PermitPulse uses CALL-E to place one authorized outbound call to the relevant permit office and returns a structured result instead of a transcript-only blob.

It captures:
- current permit status
- missing corrections or documents
- inspection readiness
- any date volunteered by the office
- department/contact information
- the smallest safe next action for the project team

## Safety boundary
PermitPulse never impersonates a government official, gives legal or code-compliance advice, pays fees, submits documents, schedules or cancels an inspection, or makes commitments. Ambiguous facts are returned as unknown.

## Technical implementation
The app is a Next.js web application with a server-side CALL-E integration. Live mode creates a CALL-E call task with a strict recipient result schema, uses a deterministic idempotency key, keeps credentials server-side, and exposes a read-only status route for result reconciliation.

A separate field-trial override can route hackathon testing only to an explicitly consenting test number without ever dialing the synthetic permit-office fixture.

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
- repository validator pass

## Built during the hackathon
PermitPulse, the permit-specific result schema, safe live-call gates, field-trial routing, tests, UI, and reusable CALL-E skill were created for this hackathon entry.

## Target prize
Most Practical Use Case.
