import { createHash } from "node:crypto";

export type PermitCase = {
  companyName: string;
  projectName: string;
  permitNumber: string;
  projectAddress: string;
  jurisdiction: string;
  officeName: string;
  recipientPhone: string;
  region: string;
  locale: string;
};

export const recipientResultSchema = {
  type: "object",
  additionalProperties: false,
  required: ["permit_status", "missing_items", "inspection_status", "next_available_date", "next_action", "follow_up_requested", "notes"],
  properties: {
    permit_status: { type: "string", enum: ["received", "in_review", "approved", "denied", "correction_required", "unknown"] },
    missing_items: { type: "string" },
    inspection_status: { type: "string", enum: ["not_required", "not_ready", "ready_to_schedule", "scheduled", "unknown"] },
    next_available_date: { type: "string" },
    next_action: { type: "string", enum: ["wait_for_review", "submit_correction", "provide_document", "schedule_inspection", "contact_reviewer", "human_review", "none"] },
    department_or_contact: { type: "string" },
    follow_up_requested: { type: "boolean" },
    notes: { type: "string" },
  },
} as const;

export function buildTask(c: PermitCase) {
  return [
    `You are an AI project-coordination assistant calling on behalf of ${c.companyName}.`,
    `At the beginning, clearly disclose that you are an AI assistant and that you are not a government official.`,
    `Ask only about permit ${c.permitNumber} for ${c.projectName} at ${c.projectAddress} in ${c.jurisdiction}.`,
    `Goal: determine the current permit status, any missing correction or document, whether an inspection is required or ready to schedule, any available date the office volunteers, and the smallest administrative next action for the project team.`,
    `Do not make legal or code-compliance claims, pay fees, submit documents, schedule or cancel an inspection, impersonate an official, disclose unrelated private information, or make commitments on behalf of either party.`,
    `If the office cannot discuss the case or asks you to stop, end the call. Record unknown instead of guessing.`,
  ].join(" ");
}

export function resolveDialPhone(c: PermitCase, fieldTrialPhone?: string) {
  const candidate = (fieldTrialPhone || c.recipientPhone).trim();
  if (!/^\+\d{8,15}$/.test(candidate)) throw new Error("Dial phone must be valid E.164.");
  return candidate;
}

export function idempotencyKey(c: PermitCase, dialPhone = c.recipientPhone) {
  const canonical = JSON.stringify({
    companyName: c.companyName.trim(), projectName: c.projectName.trim(), permitNumber: c.permitNumber.trim(),
    projectAddress: c.projectAddress.trim(), jurisdiction: c.jurisdiction.trim(), recipientPhone: dialPhone.trim(),
    region: c.region, locale: c.locale,
  });
  return `pp_${createHash("sha256").update(canonical).digest("hex").slice(0, 32)}`;
}

export function validateCase(c: PermitCase) {
  const errors: string[] = [];
  if (!c.companyName.trim()) errors.push("Company name is required.");
  if (!c.projectName.trim()) errors.push("Project name is required.");
  if (!c.permitNumber.trim()) errors.push("Permit number is required.");
  if (!c.projectAddress.trim()) errors.push("Project address is required.");
  if (!c.jurisdiction.trim()) errors.push("Jurisdiction is required.");
  if (!/^\+\d{8,15}$/.test(c.recipientPhone.trim())) errors.push("Phone must be E.164, for example +14155550123.");
  return errors;
}
