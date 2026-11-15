# LeadFlow

LeadFlow is a human-approved lead-to-quote operations system for service businesses. It records every enquiry, prevents duplicate work, drafts a reply, and requires a person to approve a commercial commitment.

## Why this exists

Most service businesses lose work between a web enquiry, a first response, discovery, and a quote. LeadFlow treats that as one accountable workflow—not as an isolated chatbot.

## First release

- Idempotent lead capture
- Explicit pipeline stages
- AI-ready reply drafts that cannot send themselves
- Quote approval before a commercial commitment
- Immutable activity records for audit and recovery

The first code slice is intentionally the domain core. A web UI, authentication, persistence, and channel adapters follow after the workflow is verified.

## Agent logic

The agent never sends a message, promises a price, or changes a lead's stage by itself. It has four jobs:

1. Read the captured lead.
2. Produce a structured recommendation: qualify, ask for information, or decline.
3. Produce a reply draft with explicit assumptions.
4. Hand the recommendation to a named human review queue.

The policy layer runs after the reasoning layer. A high-confidence recommendation can still be blocked by policy: for example, any request mentioning regulated work, security work, or a custom price requires review. Later we can replace the deterministic reasoner with an LLM and add RAG, without changing the policy or approval boundary.

## Run tests

Requires Node 22+.

```sh
npm test
```
