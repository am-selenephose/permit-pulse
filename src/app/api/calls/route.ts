import { NextResponse } from "next/server";
import { buildTask, idempotencyKey, recipientResultSchema, validateCase, type ReceivableCase } from "@/lib/receivables";

const BASE_URL = process.env.CALLE_BASE_URL || "https://api.heycall-e.com";

type LiveRequest = {
  receivable: ReceivableCase;
  contactPermission: boolean;
  aiDisclosureApproved: boolean;
  liveCallIntent: boolean;
};

export async function POST(request: Request) {
  const apiKey = process.env.CALLE_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "CALL-E live mode is not configured on this deployment." }, { status: 503 });
  }

  let body: LiveRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  if (body.contactPermission !== true || body.aiDisclosureApproved !== true || body.liveCallIntent !== true) {
    return NextResponse.json({ error: "Live calls require contact permission, AI disclosure approval, and fresh call intent." }, { status: 400 });
  }

  const errors = validateCase(body.receivable);
  if (errors.length) return NextResponse.json({ error: errors.join(" ") }, { status: 400 });

  const c = body.receivable;
  const payload = {
    task: buildTask(c),
    recipients: [{ phones: [c.recipientPhone], region: c.region, locale: c.locale }],
    recipient_result_schema: recipientResultSchema,
    metadata: {
      product: "receivable-radar",
      invoice_number: c.invoiceNumber,
    },
  };

  const response = await fetch(`${BASE_URL}/v1/calls`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": idempotencyKey(c),
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  const raw = await response.json().catch(() => ({}));
  if (!response.ok) {
    return NextResponse.json({ error: raw?.message || raw?.error || `CALL-E returned HTTP ${response.status}.`, provider: raw }, { status: response.status });
  }

  const callId = raw?.id ?? raw?.call_id ?? raw?.callId;
  if (!callId) return NextResponse.json({ error: "CALL-E accepted the request but no call ID was returned.", provider: raw }, { status: 502 });

  return NextResponse.json({ callId, status: raw?.status || "accepted" }, { status: 201 });
}
