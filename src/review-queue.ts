import type { AgentRecommendation } from "./agent.ts";

export type ReviewStatus = "pending" | "approved" | "rejected";

export type ReviewItem = {
  id: string;
  recommendation: AgentRecommendation;
  status: ReviewStatus;
  reviewedBy: string | null;
  decisionNote: string | null;
};

/**
 * The queue is the boundary between an agent proposal and a business action.
 * It intentionally has no send-email or CRM-write capability.
 */
export class ReviewQueue {
  private readonly itemsByLead = new Map<string, ReviewItem>();

  submit(recommendation: AgentRecommendation): ReviewItem {
    const existing = this.itemsByLead.get(recommendation.leadId);
    if (existing) return existing;

    const item: ReviewItem = {
      id: `review_${this.itemsByLead.size + 1}`,
      recommendation,
      status: "pending",
      reviewedBy: null,
      decisionNote: null,
    };
    this.itemsByLead.set(recommendation.leadId, item);
    return item;
  }

  decide(leadId: string, status: Exclude<ReviewStatus, "pending">, reviewedBy: string, note: string): ReviewItem {
    const item = this.itemsByLead.get(leadId);
    if (!item) throw new Error("No review item exists for this lead");
    if (item.status !== "pending") throw new Error("A review decision already exists for this lead");
    if (!reviewedBy.trim()) throw new Error("A named human reviewer is required");
    if (!note.trim()) throw new Error("A decision note is required");

    item.status = status;
    item.reviewedBy = reviewedBy.trim();
    item.decisionNote = note.trim();
    return item;
  }

  get(leadId: string): ReviewItem | undefined {
    return this.itemsByLead.get(leadId);
  }
}
