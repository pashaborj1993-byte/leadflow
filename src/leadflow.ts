export type LeadStage = "received" | "qualified" | "quote_drafted" | "quote_approved" | "won" | "lost";

export type Lead = {
  id: string;
  idempotencyKey: string;
  customerName: string;
  email: string;
  request: string;
  stage: LeadStage;
  draftReply: string | null;
  approvedQuoteCents: number | null;
};

export type Activity = { leadId: string; kind: string; detail: string };

export class LeadFlow {
  private readonly leadsByKey = new Map<string, Lead>();
  readonly activity: Activity[] = [];

  capture(input: Omit<Lead, "id" | "stage" | "draftReply" | "approvedQuoteCents">): Lead {
    const existing = this.leadsByKey.get(input.idempotencyKey);
    if (existing) return existing;
    if (!input.customerName.trim() || !input.email.includes("@") || !input.request.trim()) {
      throw new Error("A customer name, valid email, and request are required");
    }
    const lead: Lead = {
      ...input,
      id: `lead_${this.leadsByKey.size + 1}`,
      stage: "received",
      draftReply: null,
      approvedQuoteCents: null,
    };
    this.leadsByKey.set(lead.idempotencyKey, lead);
    this.activity.push({ leadId: lead.id, kind: "captured", detail: "Lead captured" });
    return lead;
  }

  qualify(lead: Lead): void {
    this.requireStage(lead, "received");
    lead.stage = "qualified";
    this.activity.push({ leadId: lead.id, kind: "qualified", detail: "Human marked lead qualified" });
  }

  draftReply(lead: Lead, draft: string): void {
    this.requireStage(lead, "qualified");
    if (!draft.trim()) throw new Error("A draft reply is required");
    lead.draftReply = draft.trim();
    this.activity.push({ leadId: lead.id, kind: "reply_drafted", detail: "Draft awaits human review" });
  }

  prepareQuote(lead: Lead): void {
    this.requireStage(lead, "qualified");
    lead.stage = "quote_drafted";
    this.activity.push({ leadId: lead.id, kind: "quote_drafted", detail: "Quote awaits approval" });
  }

  approveQuote(lead: Lead, priceCents: number, approvedBy: string): void {
    this.requireStage(lead, "quote_drafted");
    if (!Number.isSafeInteger(priceCents) || priceCents <= 0) throw new Error("Quote price must be a positive whole number of cents");
    if (!approvedBy.trim()) throw new Error("A human approver is required");
    lead.approvedQuoteCents = priceCents;
    lead.stage = "quote_approved";
    this.activity.push({ leadId: lead.id, kind: "quote_approved", detail: `Approved by ${approvedBy}` });
  }

  private requireStage(lead: Lead, expected: LeadStage): void {
    if (lead.stage !== expected) throw new Error(`Expected ${expected}, found ${lead.stage}`);
  }
}
