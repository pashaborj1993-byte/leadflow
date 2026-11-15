import assert from "node:assert/strict";
import test from "node:test";
import { LeadFlow } from "./leadflow.ts";

test("capture is idempotent and leaves a visible activity record", () => {
  const flow = new LeadFlow();
  const input = { idempotencyKey: "web-42", customerName: "Maya", email: "maya@example.com", request: "Brand design" };
  const first = flow.capture(input);
  const retry = flow.capture(input);
  assert.equal(retry, first);
  assert.deepEqual(flow.activity, [{ leadId: "lead_1", kind: "captured", detail: "Lead captured" }]);
});

test("a quote cannot become a commercial commitment without human approval", () => {
  const flow = new LeadFlow();
  const lead = flow.capture({ idempotencyKey: "web-43", customerName: "Maya", email: "maya@example.com", request: "Brand design" });
  flow.qualify(lead);
  flow.prepareQuote(lead);
  assert.throws(() => flow.approveQuote(lead, 0, "Mousa"), /positive/);
  flow.approveQuote(lead, 250000, "Mousa");
  assert.equal(lead.stage, "quote_approved");
  assert.equal(lead.approvedQuoteCents, 250000);
});
