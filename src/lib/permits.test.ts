import { describe, expect, it } from "vitest";
import { buildTask, idempotencyKey, validateCase, type PermitCase } from "./permits";

const base: PermitCase = {
  companyName: "Northstar Construction",
  projectName: "Riverside Tenant Improvement",
  permitNumber: "BLD-2026-1042",
  projectAddress: "100 Market Street",
  jurisdiction: "Example City",
  officeName: "Building Department",
  recipientPhone: "+14155550123",
  region: "US",
  locale: "en-US",
};

describe("permit call contract", () => {
  it("keeps retries idempotent for the same case", () => expect(idempotencyKey(base)).toBe(idempotencyKey({ ...base })));
  it("changes identity when the permit changes", () => expect(idempotencyKey(base)).not.toBe(idempotencyKey({ ...base, permitNumber: "BLD-2026-1043" })));
  it("rejects malformed phone numbers", () => expect(validateCase({ ...base, recipientPhone: "555-1234" })).toContain("Phone must be E.164, for example +14155550123."));
  it("hard-codes the government and action boundaries", () => {
    const task = buildTask(base);
    expect(task).toContain("not a government official");
    expect(task).toContain("Do not make legal or code-compliance claims");
    expect(task).toContain("Record unknown instead of guessing");
  });
});
