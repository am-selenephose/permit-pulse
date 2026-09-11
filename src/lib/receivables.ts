import { createHash } from "node:crypto";

export type ReceivableCase = {
  businessName: string;
  invoiceNumber: string;
  amount: string;
  currency: string;
  dueDate: string;
  recipientName: string;
  recipientPhone: string;
  region: string;
  locale: string;
};

export const recipientResultSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "invoice_received",
    "dispute_status",
    "payment_status",
    "expected_resolution_date",
    "next_action",
    "follow_up_requested",
    "notes",
  ],
  properties: {
    invoice_received: { type: "string", enum: ["yes", "no", "unknown"] },
    dispute_status: { type: "string", enum: ["none", "disputed", "unclear"] },
    dispute_reason: { type: "string" },
    payment_status: { type: "string", enum: ["unpaid", "payment_sent", "unknown"] },
    expected_resolution_date: { type: "string" },
    blocker_category: {
      type: "string",
      enum: ["none", "missing_invoice", "approval_pending", "purchase_order_issue", "billing_error", "cashflow_timing", "other", "unknown"],
    },
    next_action: {
      type: "string",
      enum: ["resend_invoice", "provide_purchase_order", "correct_billing_error", "wait_for_approval", "verify_incoming_payment", "human_review", "none"],
    },
    contact_name: { type: "string" },
    follow_up_requested: { type: "boolean" },
    notes: { type: "string" },
  },
} as const;

export function buildTask(c: ReceivableCase) {
  return [
    `You are an AI calling on behalf of ${c.businessName}.`,
    `At the beginning, clearly disclose that you are an AI assistant making a business accounts-receivable follow-up call.`,
    `Ask only about invoice ${c.invoiceNumber}, amount ${c.currency} ${c.amount}, due ${c.dueDate}.`,
    `Goal: diagnose the operational exception preventing this invoice from clearing. Confirm whether the invoice was received, whether it is disputed, whether payment was already sent, the blocker category, any expected resolution date, and the smallest concrete next action our accounts-receivable team should take.`,
    `Do not ask for a promise-to-pay, collect card/bank credentials, take payment, negotiate terms, threaten consequences, make legal claims, discuss unrelated debts, or make commitments on behalf of either party.`,
    `If the recipient asks you to stop, end the call. If information is unavailable, record unknown instead of guessing.`,
  ].join(" ");
}

export function idempotencyKey(c: ReceivableCase) {
  const canonical = JSON.stringify({
    businessName: c.businessName.trim(),
    invoiceNumber: c.invoiceNumber.trim(),
    amount: c.amount.trim(),
    currency: c.currency.trim().toUpperCase(),
    dueDate: c.dueDate,
    recipientPhone: c.recipientPhone.trim(),
    region: c.region,
    locale: c.locale,
  });
  return `rr_${createHash("sha256").update(canonical).digest("hex").slice(0, 32)}`;
}

export function validateCase(c: ReceivableCase) {
  const errors: string[] = [];
  if (!c.businessName.trim()) errors.push("Business name is required.");
  if (!c.invoiceNumber.trim()) errors.push("Invoice number is required.");
  if (!/^\d+(\.\d{1,2})?$/.test(c.amount.trim())) errors.push("Amount must be a positive number with up to two decimals.");
  if (!/^[A-Z]{3}$/.test(c.currency.trim().toUpperCase())) errors.push("Currency must be a 3-letter code.");
  if (!/^\+\d{8,15}$/.test(c.recipientPhone.trim())) errors.push("Phone must be E.164, for example +14155550123.");
  if (!c.dueDate) errors.push("Due date is required.");
  return errors;
}
