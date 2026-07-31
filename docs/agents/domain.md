# Domain Docs

This repository uses a **single-context** domain model.

## Layout
- **Context**: The primary domain context is defined in `CONTEXT.md` at the root of the repository.
- **Architecture Decisions**: Architectural decisions are recorded as ADRs (Architecture Decision Records) in `docs/adr/`.

## Consumer Rules
- Agents should always read `CONTEXT.md` first to understand the domain terminology and core goals.
- Agents should check `docs/adr/` when looking for rationale behind specific technical choices.
- Any new significant architectural decisions must be documented as an ADR before implementation.
