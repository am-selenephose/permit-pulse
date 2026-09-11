# Receivable Radar

**CALL-E hackathon build:** one approved phone follow-up turns a stuck invoice into a structured accounts-receivable exception and next action.

## Why this exists

Accounts-receivable teams lose hours chasing basic facts that are often easiest to obtain by phone: Was the invoice received? Is it disputed? Is a PO missing? Is approval pending? Was payment already sent? What is the smallest action that unblocks the case?

Receivable Radar uses CALL-E for that bounded phone work, then returns a machine-readable evidence receipt. It deliberately does **not** collect payment credentials, take payment, negotiate terms, threaten collection action, or make legal claims.

## Product flow

1. Enter invoice + recipient details.
2. Review three live-call gates: contact permission, AI disclosure, and fresh intent.
3. CALL-E places one purpose-bounded outbound call.
4. CALL-E extracts structured AR fields: receipt, dispute status, payment status, blocker category, expected resolution date, and next action.
5. The UI renders a collections receipt with evidence for human review.

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

Target category: **Most Practical Use Case**. The phone is not ornamental: the product exists for payment blockers that live in accounts-payable inboxes, phone queues, and internal approval chains rather than clean APIs.

## Safety boundary

- explicit authorization before dialing
- mandatory AI disclosure approval
- one fresh intent gate per call
- E.164 validation
- deterministic idempotency key
- no payment credential collection
- no promise-to-pay requests
- no negotiation or threats
- unknown beats guessing
- human owns every downstream collections decision

## License

Proprietary. All rights reserved. The small upstream CALL-E contribution required for hackathon submission will be isolated from this application and contributed under the upstream repository's terms.
