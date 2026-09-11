import { describe, expect, it } from "vitest";
import { buildTask, idempotencyKey, validateCase, type ReceivableCase } from "./receivables";

const base: ReceivableCase = {
  businessName: "Northstar Studio",
  invoiceNumber: "INV-1042",
  amount: "1840.00",
  currency: "USD",
  dueDate: "2026-09-02",
  recipientName: "Accounts Payable",
  recipientPhone: "+14155550123",
  region: "US",
  locale: "en-US",
};

describe("receivable call contract", () => {
  it("produces a stable idempotency key for the exact same call", () => {
    expect(idempotencyKey(base)).toBe(idempotencyKey({ ...base }));
  });
  it("changes call identity when a material field changes", () => {
    expect(idempotencyKey(base)).not.toBe(idempotencyKey({ ...base, amount: "1841.00" }));
  });
  it("rejects malformed phone numbers", () => {
    expect(validateCase({ ...base, recipientPhone: "555-1234" })).toContain("Phone must be E.164, for example +14155550123.");
  });
  it("hard-codes the non-collection safety boundary into the call goal", () => {
    const task = buildTask(base);
    expect(task).toContain("Do not collect card/bank credentials");
    expect(task).toContain("or make commitments");
    expect(task).toContain("record unknown instead of guessing");
  });
});
