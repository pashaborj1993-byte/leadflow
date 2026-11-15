import assert from "node:assert/strict";
import test from "node:test";
import { runLeadAgent } from "./agent.ts";
import { LeadFlow } from "./leadflow.ts";

test("the agent qualifies a clear request but cannot send or change the lead", () => {
  const flow = new LeadFlow();
  const lead = flow.capture({
    idempotencyKey: "web-44",
    customerName: "Maya",
    email: "maya@example.com",
    request: "We need a client portal that captures project requests and gives customers approval visibility.",
  });

  const result = runLeadAgent(lead);

  assert.equal(result.recommendation, "qualify");
  assert.equal(result.requiresHumanReview, true);
  assert.equal(lead.stage, "received");
  assert.match(result.replyDraft, /discovery call/i);
});

test("the policy blocks a specialist request from autonomous handling", () => {
  const flow = new LeadFlow();
  const lead = flow.capture({
    idempotencyKey: "web-45",
    customerName: "Maya",
    email: "maya@example.com",
    request: "We need security audit automation for a regulated payments workflow with reports for auditors.",
  });

  const result = runLeadAgent(lead);

  assert.equal(result.recommendation, "request_information");
  assert.equal(result.requiresHumanReview, true);
  assert.ok(result.reasons.includes("Request needs specialist review"));
});
