"use client";

import { useEffect, useMemo, useState } from "react";

type Outcome = {
  invoice_received?: string;
  dispute_status?: string;
  dispute_reason?: string;
  payment_status?: string;
  expected_resolution_date?: string;
  blocker_category?: string;
  next_action?: string;
  contact_name?: string;
  follow_up_requested?: boolean;
  notes?: string;
};

type Result = {
  mode: "demo" | "live";
  status: string;
  callId: string;
  taskCompleted: boolean;
  confidence?: { score?: number; label?: string } | null;
  evidence: string[];
  structuredResult: Outcome | null;
  summary?: string | null;
};

const demoResult: Result = {
  mode: "demo",
  status: "completed",
  callId: "demo_call_1042",
  taskCompleted: true,
  confidence: { score: 0.91, label: "high" },
  evidence: [
    "Recipient confirmed invoice INV-2026-1042 was received.",
    "Recipient said payment is queued for September 16 after manager approval.",
  ],
  structuredResult: {
    invoice_received: "yes",
    dispute_status: "none",
    dispute_reason: "",
    payment_status: "unpaid",
    expected_resolution_date: "2026-09-16",
    blocker_category: "approval_pending",
    next_action: "wait_for_approval",
    contact_name: "Accounts Payable",
    follow_up_requested: false,
    notes: "Invoice is in the payment queue; no billing dispute was raised.",
  },
  summary: "Invoice is valid and received; payment is blocked by internal approval. No collection action needed yet — follow up after September 16.",
};

export default function Home() {
  const [form, setForm] = useState({
    businessName: "Northstar Studio",
    invoiceNumber: "INV-2026-1042",
    amount: "1840.00",
    currency: "USD",
    dueDate: "2026-09-02",
    recipientName: "Accounts Payable",
    recipientPhone: "",
    region: "US",
    locale: "en-US",
  });
  const [permission, setPermission] = useState(false);
  const [disclosure, setDisclosure] = useState(false);
  const [intent, setIntent] = useState(false);
  const [liveConfigured, setLiveConfigured] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/health").then(r => r.json()).then(d => setLiveConfigured(Boolean(d.liveConfigured))).catch(() => {});
  }, []);

  const daysLate = useMemo(() => {
    const due = new Date(`${form.dueDate}T00:00:00`);
    const now = new Date();
    return Number.isFinite(due.getTime()) ? Math.max(0, Math.floor((now.getTime() - due.getTime()) / 86400000)) : 0;
  }, [form.dueDate]);

  function update(key: keyof typeof form, value: string) {
    setForm(prev => ({ ...prev, [key]: value }));
    setIntent(false);
  }

  function runDemo() {
    setError("");
    setResult(demoResult);
  }

  async function startLive() {
    setError("");
    setResult(null);
    setBusy(true);
    try {
      const response = await fetch("/api/calls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receivable: form, contactPermission: permission, aiDisclosureApproved: disclosure, liveCallIntent: intent }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to start CALL-E call.");

      setResult({ mode: "live", status: data.status, callId: data.callId, taskCompleted: false, evidence: [], structuredResult: null });
      setIntent(false);

      for (let attempt = 0; attempt < 24; attempt++) {
        await new Promise(resolve => setTimeout(resolve, attempt === 0 ? 15000 : 7500));
        const poll = await fetch(`/api/calls/${encodeURIComponent(data.callId)}`, { cache: "no-store" });
        const p = await poll.json();
        if (!poll.ok) throw new Error(p.error || "Unable to read call status.");
        const next: Result = {
          mode: "live",
          status: p.status,
          callId: p.callId,
          taskCompleted: Boolean(p.taskCompleted),
          confidence: p.completionConfidence,
          evidence: p.evidence || [],
          structuredResult: p.structuredResult,
          summary: p.summary,
        };
        setResult(next);
        if (["completed", "failed", "canceled", "cancelled", "expired"].includes(String(p.status).toLowerCase())) break;
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error.");
    } finally {
      setBusy(false);
    }
  }

  const outcome = result?.structuredResult;

  return (
    <main className="min-h-screen bg-[#07100c] text-[#eef7f1]">
      <div className="mx-auto max-w-7xl px-5 py-7 md:px-8 md:py-10">
        <header className="mb-8 flex flex-col gap-5 border-b border-white/10 pb-7 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-semibold tracking-[0.18em] text-emerald-200 uppercase">
              CALL-E Hackathon · Accounts Receivable
            </div>
            <h1 className="text-4xl font-semibold tracking-[-0.04em] md:text-6xl">Receivable Radar</h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-white/60 md:text-lg">Turn a stuck invoice into a diagnosed AR exception — one disclosed, purpose-bounded phone call at a time.</p>
          </div>
          <div className="flex gap-3 text-xs">
            <span className={`rounded-full border px-3 py-2 ${liveConfigured ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200" : "border-amber-400/30 bg-amber-400/10 text-amber-200"}`}>
              {liveConfigured ? "● LIVE CALL-E READY" : "○ DEMO MODE"}
            </span>
          </div>
        </header>

        <section className="mb-6 grid gap-3 sm:grid-cols-3">
          <Metric label="Invoice" value={form.invoiceNumber || "—"} />
          <Metric label="Outstanding" value={`${form.currency} ${Number(form.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
          <Metric label="Days overdue" value={String(daysLate)} />
        </section>

        <div className="grid gap-6 lg:grid-cols-[1.05fr_.95fr]">
          <section className="rounded-3xl border border-white/10 bg-white/[0.045] p-5 shadow-2xl shadow-black/20 md:p-7">
            <div className="mb-6 flex items-center justify-between">
              <div><p className="text-xs font-semibold tracking-[.18em] text-emerald-300 uppercase">01 · Case</p><h2 className="mt-1 text-2xl font-semibold">Prepare the follow-up</h2></div>
              <span className="text-xs text-white/40">No payment collection</span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Your business" value={form.businessName} onChange={v => update("businessName", v)} />
              <Field label="Invoice number" value={form.invoiceNumber} onChange={v => update("invoiceNumber", v)} />
              <Field label="Amount" value={form.amount} onChange={v => update("amount", v)} />
              <Field label="Currency" value={form.currency} onChange={v => update("currency", v.toUpperCase())} />
              <Field label="Due date" type="date" value={form.dueDate} onChange={v => update("dueDate", v)} />
              <Field label="Recipient / team" value={form.recipientName} onChange={v => update("recipientName", v)} />
              <div className="sm:col-span-2"><Field label="Authorized phone number (E.164)" placeholder="+14155550123" value={form.recipientPhone} onChange={v => update("recipientPhone", v)} /></div>
            </div>

            <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="mb-3 text-sm font-semibold">Live-call gates</p>
              <Check checked={permission} onChange={setPermission} label="I am authorized to contact this recipient about this invoice." />
              <Check checked={disclosure} onChange={setDisclosure} label="The call may clearly disclose that the caller is an AI assistant." />
              <Check checked={intent} onChange={setIntent} label="Place this exact call now. Changing case details resets this confirmation." />
            </div>

            {error && <div className="mt-4 rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-200">{error}</div>}

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <button onClick={runDemo} className="rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold transition hover:bg-white/10">Run safe demo</button>
              <button onClick={startLive} disabled={busy || !liveConfigured || !permission || !disclosure || !intent} className="rounded-xl bg-emerald-300 px-5 py-3 text-sm font-bold text-[#07100c] transition hover:bg-emerald-200 disabled:cursor-not-allowed disabled:opacity-35">
                {busy ? "CALL-E is working…" : "Start live CALL-E follow-up"}
              </button>
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-[#0b1711] p-5 md:p-7">
            <div className="mb-6 flex items-start justify-between">
              <div><p className="text-xs font-semibold tracking-[.18em] text-emerald-300 uppercase">02 · Evidence</p><h2 className="mt-1 text-2xl font-semibold">Collections receipt</h2></div>
              {result && <span className={`rounded-full px-3 py-1 text-xs font-semibold ${result.mode === "demo" ? "bg-amber-300/10 text-amber-200" : "bg-emerald-300/10 text-emerald-200"}`}>{result.mode === "demo" ? "SYNTHETIC DEMO" : "LIVE"}</span>}
            </div>

            {!result ? (
              <div className="flex min-h-[430px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-black/10 px-8 text-center">
                <div className="mb-4 text-4xl">☎</div>
                <p className="font-semibold">No call evidence yet</p>
                <p className="mt-2 max-w-sm text-sm leading-6 text-white/45">Use the safe demo instantly, or configure CALL-E and place one authorized live call.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="flex items-center justify-between"><span className="text-xs uppercase tracking-[.16em] text-white/40">Provider status</span><span className="text-sm font-semibold text-emerald-200">{result.status}</span></div>
                  <div className="mt-2 truncate font-mono text-xs text-white/40">{result.callId}</div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Outcome label="Received" value={outcome?.invoice_received} />
                  <Outcome label="Blocker" value={outcome?.blocker_category} />
                  <Outcome label="Payment status" value={outcome?.payment_status} />
                  <Outcome label="Next action" value={outcome?.next_action} />
                  <Outcome label="Dispute" value={outcome?.dispute_status} />
                  <Outcome label="Resolution date" value={outcome?.expected_resolution_date} />
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-xs uppercase tracking-[.16em] text-white/40">Machine-readable next step</p>
                  <p className="mt-2 text-sm leading-6 text-white/80">{result.summary || outcome?.notes || "Waiting for a terminal CALL-E result…"}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-xs uppercase tracking-[.16em] text-white/40">Evidence</p>
                  <div className="mt-3 space-y-2">
                    {result.evidence.length ? result.evidence.map((item, i) => <p key={i} className="rounded-lg bg-white/[.04] px-3 py-2 text-sm leading-6 text-white/70">{item}</p>) : <p className="text-sm text-white/40">No evidence returned yet.</p>}
                  </div>
                </div>
                <div className="rounded-2xl border border-emerald-300/20 bg-emerald-300/[.06] p-4 text-sm leading-6 text-emerald-100/80">
                  <strong className="text-emerald-200">Boundary:</strong> Receivable Radar never asks for a promise-to-pay, takes payment, collects financial credentials, negotiates terms, or threatens collection action. It diagnoses the operational exception so a human AR team knows the smallest next step.
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl border border-white/10 bg-white/[.035] px-5 py-4"><p className="text-xs uppercase tracking-[.16em] text-white/35">{label}</p><p className="mt-1 text-xl font-semibold">{value}</p></div>;
}
function Field({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return <label className="block"><span className="mb-1.5 block text-xs font-medium text-white/50">{label}</span><input type={type} value={value} placeholder={placeholder} onChange={e => onChange(e.target.value)} className="w-full rounded-xl border border-white/10 bg-black/25 px-3.5 py-3 text-sm outline-none transition placeholder:text-white/20 focus:border-emerald-300/40 focus:ring-2 focus:ring-emerald-300/10" /></label>;
}
function Check({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return <label className="mb-2.5 flex cursor-pointer items-start gap-3 text-sm leading-5 text-white/60"><input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} className="mt-1 accent-emerald-300" /><span>{label}</span></label>;
}
function Outcome({ label, value }: { label: string; value?: string }) {
  return <div className="rounded-xl border border-white/10 bg-white/[.035] p-3"><p className="text-[10px] uppercase tracking-[.15em] text-white/35">{label}</p><p className="mt-1 break-words text-sm font-semibold capitalize text-white/85">{value?.replaceAll("_", " ") || "—"}</p></div>;
}
