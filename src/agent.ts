import type { Lead } from "./leadflow.ts";

export type Recommendation = "qualify" | "request_information" | "decline";

export type AgentRecommendation = {
  leadId: string;
  recommendation: Recommendation;
  confidence: number;
  reasons: string[];
  replyDraft: string;
  requiresHumanReview: true;
};

export type LeadReasoner = {
  recommend(lead: Pick<Lead, "id" | "customerName" | "email" | "request">): Omit<AgentRecommendation, "leadId" | "requiresHumanReview">;
};

const restrictedTopics = /security audit|legal advice|medical|credit|employment|regulated/i;

/**
 * Policy is deliberately separate from reasoning. An LLM may replace the
 * reasoner later, but it must not be allowed to weaken this review boundary.
 */
export function applyPolicy(lead: Lead, proposal: Omit<AgentRecommendation, "leadId" | "requiresHumanReview">): AgentRecommendation {
  const reasons = [...proposal.reasons];
  if (restrictedTopics.test(lead.request)) reasons.push("Request needs specialist review");
  if (proposal.confidence < 0.8) reasons.push("Recommendation confidence is below the automatic-action threshold");

  return {
    ...proposal,
    leadId: lead.id,
    reasons,
    // This remains true even when confidence is high. Commercial communication
    // is an external action and a human owns it.
    requiresHumanReview: true,
  };
}

export class RulesLeadReasoner implements LeadReasoner {
  recommend(lead: Pick<Lead, "id" | "customerName" | "email" | "request">): Omit<AgentRecommendation, "leadId" | "requiresHumanReview"> {
    const request = lead.request.trim();
    const hasEnoughDetail = request.length >= 30;

    if (!hasEnoughDetail) {
      return {
        recommendation: "request_information",
        confidence: 0.9,
        reasons: ["The request lacks enough detail to scope work"],
        replyDraft: `Thanks ${lead.customerName}. To recommend the right next step, could you share your goal, timeline, and the systems you use today?`,
      };
    }

    if (restrictedTopics.test(request)) {
      return {
        recommendation: "request_information",
        confidence: 0.78,
        reasons: ["The request mentions a specialist or regulated area"],
        replyDraft: `Thanks ${lead.customerName}. We need a short discovery call before confirming whether this request is in scope. Could you share the intended outcome and any compliance constraints?`,
      };
    }

    return {
      recommendation: "qualify",
      confidence: 0.86,
      reasons: ["The request describes a concrete business outcome"],
      replyDraft: `Thanks ${lead.customerName}. Your request sounds like a good fit for a short discovery call. We will review the workflow, current tools, and desired outcome before proposing scope or price.`,
    };
  }
}

export function runLeadAgent(lead: Lead, reasoner: LeadReasoner = new RulesLeadReasoner()): AgentRecommendation {
  const proposal = reasoner.recommend(lead);
  return applyPolicy(lead, proposal);
}
