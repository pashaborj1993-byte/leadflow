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

## Run tests

Requires Node 22+.

```sh
npm test
```
