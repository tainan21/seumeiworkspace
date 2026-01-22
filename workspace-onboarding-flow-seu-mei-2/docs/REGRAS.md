# Task Generation Domain — Rules & Constraints

## 1. Purpose

This document defines the **canonical rules** for the Task Generation Domain.
Its purpose is to ensure that any generated task:
- Is grounded in the real project structure
- Respects existing domains and workflows
- Produces economic and operational value
- Never invents features, flows, or abstractions

The Task Generation Domain **does not execute tasks**.
It only **proposes tasks** based on validated context.

---

## 2. Source of Truth

All task generation must rely exclusively on:

### Frontend Routes
- `/`
- `/dashboard`
- `/dashboard/financeiro`
- `/onboarding`

### API Domains (Production)
- `/api/domains/page`
- `/api/domains/theme`
- `/api/domains/workspace`

### API Domains (Mock / Simulation)
- `/api/mock/domains/preview`
- `/api/mock/domains/templates`
- `/api/mock/domains/validate-id`
- `/api/mock/domains/workspace`

### Core Domain Logic
- `domains/company`
- `domains/page`
- `domains/rbac`
- `domains/template`
- `domains/theme`
- `domains/workspace`

### Supporting Infrastructure
- `lib/db/*`
- `lib/stores/onboarding-store.ts`
- `lib/mock-data/*`
- `scripts/*.sql`

No other folders, routes, or concepts may be assumed.

---

## 3. TaskGenerationContext

All tasks MUST be derived from a **TaskGenerationContext** built from the current workspace.

The context must include, at minimum:

- Company type and structure
- Enabled domains and features
- Onboarding completion state
- Existing pages, themes, templates, and permissions
- Plan or limitation signals (explicit or implicit)

If a piece of information is not present in the workspace or onboarding state, it must be treated as **unknown**, not assumed.

---

## 4. What a Task Is

A task represents a **concrete, actionable step** that:
- Advances the system configuration
- Improves usability, structure, or readiness
- Is realistically executable within the current project

A task is **not**:
- A feature idea
- A long-term roadmap item
- A vague recommendation
- A duplicated onboarding step

---

## 5. Allowed Task Domains

Tasks may only belong to one of the following domains:

- `company`
- `workspace`
- `page`
- `theme`
- `template`
- `rbac`
- `onboarding`
- `dashboard`
- `financeiro`
- `infrastructure`

If a task does not clearly map to one of these domains, it must not be generated.

---

## 6. Task Structure (Conceptual)

Every generated task must clearly define:

- **Title**: concise and specific
- **Description**: what will be done and why
- **Domain**: one allowed domain
- **Estimated Effort**: relative, not absolute
- **Value Rationale**: why this task matters now
- **Dependencies**: only if they truly exist

Tasks without clear value or execution logic are invalid.

---

## 7. Hard Constraints (Non-Negotiable)

The Task Generation Domain MUST NOT:

- Invent new domains, APIs, or database tables
- Assume missing onboarding steps
- Bypass RBAC or permission logic
- Create tasks that contradict existing templates or schemas
- Reference external services not present in the project
- Generate tasks unrelated to the current workspace state

Violating any of the above invalidates the output.

---

## 8. Economic & Effort Rules

- Effort must be proportional to task scope
- Value must be justified by system impact
- Tasks should prefer **incremental progress** over large refactors
- No task may assume unlimited resources or enterprise-only features unless explicitly present

Pricing, coins, or rewards are **not decided here**.
This domain only provides structured inputs for economic evaluation.

---

## 9. Forbidden Behaviors

The following behaviors are explicitly forbidden:

- Guessing user intent
- Filling gaps with “best practices”
- Generating speculative improvements
- Rewriting or replacing onboarding logic
- Treating mock domains as production features

If uncertainty exists, the correct action is to **not generate the task**.

---

## 10. Output Validity Rule

Any task that does not comply with:
- This document
- The observed project structure
- The available workspace context

Must be considered **invalid and discarded**.

The Task Generation Domain values **correctness over quantity**.
