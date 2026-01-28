# Immutable System Contract

> **Purpose**: Define the *non‑negotiable* architectural rules of the system.
> **Audience**: Humans, AIs, agents, tools.
> **Nature**: Constitutional — concise, enforceable, immutable by default.

---

## 1. Core Principle (Tenant Model)

* **Workspace is the root tenant**.
* **Every business entity MUST belong to a workspace**.

### Mandatory Rules

* Every business record **MUST contain `workspaceId`**.
* Every business query **MUST filter by `workspaceId`**.

> Exceptions only exist for explicit *global domains* (e.g. `admin`).

---

## 2. Layered Architecture

```
UI            → src/app/, src/components/
Application   → src/domains/*/actions/, src/server/
Domain        → src/domains/*/services/
Infra         → src/lib/server/, prisma/
Types         → src/types/, src/domains/*/types.ts
```

### Dependency Direction (Strict)

* UI → Application, Domain, Types
* Application → Domain, Infra, Types
* Domain → Types (and DB abstractions only)
* Infra → Types, external libs
* Types → **nothing**

---

## 3. Folder Responsibilities

| Concern           | Location                                  |
| ----------------- | ----------------------------------------- |
| Pages & Routes    | `src/app/`                                |
| React Components  | `src/components/`                         |
| Server Actions    | `src/domains/*/actions/` or `src/server/` |
| Business Logic    | `src/domains/*/services/`                 |
| Domain Types      | `src/domains/*/types.ts`                  |
| Shared Types      | `src/types/`                              |
| DB / Prisma       | `prisma/`, `src/lib/server/db.ts`         |
| Payments / Stripe | `src/lib/server/payment.ts`               |

---

## 4. Domain Rules (Hard)

* Domain code is **framework‑agnostic**.
* No React, no Next.js, no hooks, no navigation.
* No global mutable state.
* Services receive data → return data.

**Domain MAY NOT:**

* Import UI or app layers
* Import Next.js APIs
* Import Stripe or payment SDKs directly

---

## 5. Server Actions Rules

* All mutations happen via **Server Actions**.
* Every action file **MUST** start with:

```ts
"use server"
```

* Authentication and workspace access validation happen here.
* UI components never access DB directly.

---

## 6. Data Access Rules

* Database access is **server‑only**.
* Prisma is allowed only in:

  * `src/lib/server/*`
  * domain services (server side)

### Forbidden

```ts
prisma.anything.findMany({}) // ❌ no workspace filter
```

### Required

```ts
prisma.anything.findMany({ where: { workspaceId } }) // ✅
```

---

## 7. Billing & Payments

* Stripe exists **only** in `src/lib/server/payment.ts`.
* Domains interact with billing **only via abstractions**.
* Features never know *how* payment is implemented.

---

## 8. Domain Structure (Canonical)

```
src/domains/{domain}/
├── index.ts        # public exports only
├── types.ts        # domain types
├── services/       # pure business logic
├── actions/        # server actions
└── errors.ts       # optional
```

---

## 9. Naming Conventions

* Files: `kebab-case`
* Types / Classes: `PascalCase`
* Functions / vars: `camelCase`
* Constants / Enums: `SCREAMING_SNAKE_CASE`

---

## 10. Immutables (Never Break)

1. Workspace is the tenant root
2. `workspaceId` is mandatory in business data
3. All business queries filter by `workspaceId`
4. Domain has no framework dependencies
5. Billing is isolated from features
6. Mutations are server‑first

---

## 11. Enforcement Mindset

If a rule is unclear:

* **Prefer isolation over convenience**
* **Prefer domain purity over speed**
* **Prefer explicit boundaries over magic**

If a rule is violated:

* The implementation is **invalid**, even if it works.

---

**Status**: Active
**Change Policy**: Architectural review only
  