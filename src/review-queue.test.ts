import assert from "node:assert/strict";
import test from "node:test";
import { runLeadAgent } from "./agent.ts";
import { LeadFlow } from "./leadflow.ts";
import { ReviewQueue } from "./review-queue.ts";

test("a human identity and note are required before a proposal has a decision", () => {
  const flow = new LeadFlow();
  const lead = flow.capture({
    idempotencyKey: "web-46",
    customerName: "Maya",
    email: "maya@example.com",
    request: "We need a portal that makes every project request visible to customers and managers.",
  });
  const queue = new ReviewQueue();
  const item = queue.submit(runLeadAgent(lead));

  assert.equal(item.status, "pending");
  assert.throws(() => queue.decide(lead.id, "approved", "", "Looks good"), /named human reviewer/);

  const decision = queue.decide(lead.id, "approved", "Pasha", "Approve draft for editing before sending");
  assert.equal(decision.status, "approved");
  assert.equal(decision.reviewedBy, "Pasha");
  assert.throws(() => queue.decide(lead.id, "rejected", "Pasha", "Changed my mind"), /already exists/);
});

test("submitting the same lead recommendation is idempotent", () => {
  const flow = new LeadFlow();
  const lead = flow.capture({
    idempotencyKey: "web-47",
    customerName: "Maya",
    email: "maya@example.com",
    request: "We need help automating lead follow-up across our existing contact form and email inbox.",
  });
  const queue = new ReviewQueue();
  const recommendation = runLeadAgent(lead);

  assert.equal(queue.submit(recommendation), queue.submit(recommendation));
});
