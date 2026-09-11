import { NextResponse } from "next/server";

const BASE_URL = process.env.CALLE_BASE_URL || "https://api.heycall-e.com";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const apiKey = process.env.CALLE_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "CALL-E live mode is not configured." }, { status: 503 });

  const { id } = await context.params;
  if (!/^[-_a-zA-Z0-9]+$/.test(id)) return NextResponse.json({ error: "Invalid call ID." }, { status: 400 });

  const response = await fetch(`${BASE_URL}/v1/calls/${encodeURIComponent(id)}`, {
    headers: { Authorization: `Bearer ${apiKey}` },
    cache: "no-store",
  });
  const raw = await response.json().catch(() => ({}));
  if (!response.ok) return NextResponse.json({ error: raw?.message || raw?.error || `CALL-E returned HTTP ${response.status}.` }, { status: response.status });

  const recipient = raw?.recipients?.[0] ?? {};
  return NextResponse.json({
    callId: raw?.id ?? raw?.call_id ?? id,
    status: raw?.status ?? "unknown",
    taskCompleted: raw?.task_completed ?? false,
    completionConfidence: raw?.completion_confidence ?? null,
    evidence: Array.isArray(raw?.evidence) ? raw.evidence : [],
    structuredResult: recipient?.structured_result ?? raw?.structured_result ?? null,
    summary: recipient?.summary ?? raw?.summary ?? null,
  });
}
