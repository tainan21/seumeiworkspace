# SEUMEI v1.0 — Comprehensive Architectural Blueprint

> Universal Platform for MEIs | Multi-Tenant Core Engine | Matriz Ecosystem Foundation

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Architectural Principles](#2-architectural-principles)
3. [Technology Stack Decisions](#3-technology-stack-decisions)
4. [Multi-Tenancy Architecture](#4-multi-tenancy-architecture)
5. [System Architecture](#5-system-architecture)
6. [Monorepo Structure](#6-monorepo-structure)
7. [Module Engine Architecture](#7-module-engine-architecture)
8. [API Architecture](#8-api-architecture)
9. [Data Architecture](#9-data-architecture)
10. [Authentication & Authorization](#10-authentication--authorization)
11. [Async Workflows & Background Jobs](#11-async-workflows--background-jobs)
12. [Real-Time Architecture](#12-real-time-architecture)
13. [Telemetry & Observability](#13-telemetry--observability)
14. [Audit System](#14-audit-system)
15. [SEUMEI UI Design System](#15-seumei-ui-design-system)
16. [External App Support](#16-external-app-support)
17. [Design Patterns Catalog](#17-design-patterns-catalog)
18. [Data Flow Diagrams](#18-data-flow-diagrams)
19. [Security Architecture](#19-security-architecture)
20. [Deployment & Infrastructure](#20-deployment--infrastructure)
21. [Versioning Strategy](#21-versioning-strategy)
22. [Migration Strategy](#22-migration-strategy)
23. [Cost Analysis](#23-cost-analysis)
24. [Roadmap Integration](#24-roadmap-integration)

---

## 1. Executive Summary

### 1.1 Vision Statement

SEUMEI is a universal platform designed specifically for Brazilian MEIs (Microempreendedores Individuais), functioning as the foundational multi-tenant engine that powers the entire Matriz ecosystem of satellite applications including SpotVibe, Harmonix, Pelada, MeuPintor, and MatrizPay.

### 1.2 Core Objectives

\`\`\`
┌─────────────────────────────────────────────────────────────────────────────┐
│                         SEUMEI CORE OBJECTIVES                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐             │
│  │   SCALABILITY   │  │    SECURITY     │  │  MODULARITY     │             │
│  │                 │  │                 │  │                 │             │
│  │ Support 100K+   │  │ Bank-grade      │  │ Plug-and-play   │             │
│  │ tenants with    │  │ isolation with  │  │ module system   │             │
│  │ linear scaling  │  │ schema + RLS    │  │ for ecosystem   │             │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘             │
│                                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐             │
│  │ MAINTAINABILITY │  │ COST EFFICIENCY │  │   LONGEVITY     │             │
│  │                 │  │                 │  │                 │             │
│  │ Clean arch with │  │ Start at $150/m │  │ 15-year viable  │             │
│  │ clear boundaries│  │ scale to $5K/m  │  │ architecture    │             │
│  │ and patterns    │  │ at 50K tenants  │  │ with evolution  │             │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘             │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
\`\`\`

### 1.3 Key Differentiators

| Aspect | Traditional ERP | SEUMEI Approach |
|--------|-----------------|-----------------|
| **Tenancy** | Shared tables | Schema-per-tenant + RLS |
| **Modularity** | Monolithic | Plugin-based engine |
| **Integration** | Point-to-point | Universal API gateway |
| **UI** | Generic | Purpose-built MEI-centric |
| **Scale** | Vertical | Horizontal + serverless |

---

## 2. Architectural Principles

### 2.1 Guiding Principles

\`\`\`
┌─────────────────────────────────────────────────────────────────────────────┐
│                      ARCHITECTURAL PRINCIPLES                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  P1. SEPARATION OF CONCERNS                                                 │
│  ├── Each layer has a single responsibility                                 │
│  ├── Domain logic isolated from infrastructure                              │
│  └── UI components decoupled from business rules                            │
│                                                                             │
│  P2. DEPENDENCY INVERSION                                                   │
│  ├── High-level modules don't depend on low-level modules                   │
│  ├── Both depend on abstractions (interfaces/contracts)                     │
│  └── Infrastructure adapters implement domain ports                         │
│                                                                             │
│  P3. BOUNDED CONTEXTS                                                       │
│  ├── Each module is a bounded context with clear boundaries                 │
│  ├── Communication via well-defined contracts                               │
│  └── Shared kernel for common domain concepts                               │
│                                                                             │
│  P4. EVENT-DRIVEN ARCHITECTURE                                              │
│  ├── Modules communicate through domain events                              │
│  ├── Async workflows for non-critical paths                                 │
│  └── Event sourcing for audit-critical operations                           │
│                                                                             │
│  P5. INFRASTRUCTURE AS CODE                                                 │
│  ├── All infrastructure declaratively defined                               │
│  ├── Reproducible environments                                              │
│  └── Version-controlled configuration                                       │
│                                                                             │
│  P6. ZERO TRUST SECURITY                                                    │
│  ├── Verify at every layer                                                  │
│  ├── Principle of least privilege                                           │
│  └── Defense in depth                                                       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
\`\`\`

### 2.2 Quality Attributes (NFRs)

\`\`\`
┌─────────────────────────────────────────────────────────────────────────────┐
│                    NON-FUNCTIONAL REQUIREMENTS                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  PERFORMANCE                                                                │
│  ├── API response time: p95 < 200ms                                         │
│  ├── Page load time: LCP < 2.5s                                             │
│  ├── Database queries: p95 < 50ms                                           │
│  └── Background job latency: < 30s for standard, < 5min for heavy           │
│                                                                             │
│  AVAILABILITY                                                               │
│  ├── Target: 99.9% uptime (8.76h downtime/year)                             │
│  ├── RTO (Recovery Time Objective): < 1 hour                                │
│  └── RPO (Recovery Point Objective): < 5 minutes                            │
│                                                                             │
│  SCALABILITY                                                                │
│  ├── Horizontal: Add nodes without architecture changes                     │
│  ├── Vertical: Support 10x growth without redesign                          │
│  └── Tenant: Support 100K+ tenants with isolation                           │
│                                                                             │
│  SECURITY                                                                   │
│  ├── LGPD compliance from day one                                           │
│  ├── SOC 2 Type II readiness by v3.0                                        │
│  └── PCI-DSS readiness for payment features                                 │
│                                                                             │
│  MAINTAINABILITY                                                            │
│  ├── Code coverage: > 80% for critical paths                                │
│  ├── Cyclomatic complexity: < 10 per function                               │
│  └── Documentation: API docs auto-generated                                 │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
\`\`\`

---

## 3. Technology Stack Decisions

### 3.1 Final Stack Selection

\`\`\`
┌─────────────────────────────────────────────────────────────────────────────┐
│                         SEUMEI TECHNOLOGY STACK                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ╔═══════════════════════════════════════════════════════════════════════╗ │
│  ║                        APPLICATION LAYER                               ║ │
│  ╠═══════════════════════════════════════════════════════════════════════╣ │
│  ║                                                                        ║ │
│  ║  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐    ║ │
│  ║  │    Next.js 15    │  │   React 19       │  │   TypeScript 5   │    ║ │
│  ║  │   App Router     │  │   Server Comp.   │  │   Strict Mode    │    ║ │
│  ║  │  Server Actions  │  │   Suspense       │  │                  │    ║ │
│  ║  └──────────────────┘  └──────────────────┘  └──────────────────┘    ║ │
│  ║                                                                        ║ │
│  ╚═══════════════════════════════════════════════════════════════════════╝ │
│                                                                             │
│  ╔═══════════════════════════════════════════════════════════════════════╗ │
│  ║                          DATA LAYER                                    ║ │
│  ╠═══════════════════════════════════════════════════════════════════════╣ │
│  ║                                                                        ║ │
│  ║  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐    ║ │
│  ║  │   PostgreSQL     │  │     Kysely       │  │  Upstash Redis   │    ║ │
│  ║  │   (Neon)         │  │   Type-safe SQL  │  │  Cache + Realtime│    ║ │
│  ║  │  Schema/tenant   │  │   Query Builder  │  │  Pub/Sub         │    ║ │
│  ║  └──────────────────┘  └──────────────────┘  └──────────────────┘    ║ │
│  ║                                                                        ║ │
│  ╚═══════════════════════════════════════════════════════════════════════╝ │
│                                                                             │
│  ╔═══════════════════════════════════════════════════════════════════════╗ │
│  ║                       INFRASTRUCTURE LAYER                             ║ │
│  ╠═══════════════════════════════════════════════════════════════════════╣ │
│  ║                                                                        ║ │
│  ║  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐    ║ │
│  ║  │     Vercel       │  │     Inngest      │  │   Vercel Blob    │    ║ │
│  ║  │   Edge Network   │  │  Async Workflows │  │  File Storage    │    ║ │
│  ║  │   Serverless     │  │  Event-driven    │  │                  │    ║ │
│  ║  └──────────────────┘  └──────────────────┘  └──────────────────┘    ║ │
│  ║                                                                        ║ │
│  ║  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐    ║ │
│  ║  │     Clerk        │  │     Stripe       │  │     Resend       │    ║ │
│  ║  │  Authentication  │  │    Payments      │  │  Transactional   │    ║ │
│  ║  │  Multi-tenant    │  │    Billing       │  │  Email           │    ║ │
│  ║  └──────────────────┘  └──────────────────┘  └──────────────────┘    ║ │
│  ║                                                                        ║ │
│  ╚═══════════════════════════════════════════════════════════════════════╝ │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
\`\`\`

### 3.2 Technology Decision Records

#### TDR-001: Next.js 15 App Router with Server Actions

\`\`\`
┌─────────────────────────────────────────────────────────────────────────────┐
│ TDR-001: NEXT.JS 15 AS PRIMARY FRAMEWORK                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ STATUS: ACCEPTED                                                            │
│                                                                             │
│ CONTEXT:                                                                    │
│ Need a fullstack framework that supports SSR, Server Components,            │
│ edge deployment, and has excellent TypeScript support with minimal          │
│ infrastructure overhead.                                                    │
│                                                                             │
│ DECISION:                                                                   │
│ Adopt Next.js 15 App Router with Server Actions as the primary              │
│ application framework.                                                      │
│                                                                             │
│ RATIONALE:                                                                  │
│ ┌───────────────────────────────────────────────────────────────────────┐  │
│ │ Criterion          │ Next.js 15 │ NestJS    │ Remix     │ Nuxt 3    │  │
│ ├────────────────────┼────────────┼───────────┼───────────┼───────────┤  │
│ │ Fullstack unified  │    ★★★★★   │   ★★★     │   ★★★★    │   ★★★★    │  │
│ │ Server Components  │    ★★★★★   │   N/A     │   ★★★★    │   ★★★     │  │
│ │ Type safety        │    ★★★★★   │   ★★★★★   │   ★★★★    │   ★★★★    │  │
│ │ Edge deployment    │    ★★★★★   │   ★★      │   ★★★★    │   ★★★     │  │
│ │ Ecosystem          │    ★★★★★   │   ★★★★    │   ★★★     │   ★★★     │  │
│ │ Learning curve     │    ★★★★    │   ★★★     │   ★★★★    │   ★★★★    │  │
│ │ Vercel integration │    ★★★★★   │   ★★★     │   ★★★★    │   ★★★     │  │
│ └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│ CONSEQUENCES:                                                               │
│ + Zero-config deployment on Vercel                                          │
│ + Native Server Actions reduce API boilerplate                              │
│ + React 19 features (Server Components, Suspense)                           │
│ + Excellent caching and ISR capabilities                                    │
│ - Platform coupling with Vercel (acceptable trade-off)                      │
│ - Learning curve for Server Components paradigm                             │
│                                                                             │
│ MIGRATION PATH:                                                             │
│ If needed, core business logic in /packages/core remains portable           │
│ to any Node.js runtime.                                                     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
\`\`\`

#### TDR-002: Kysely as Query Builder

\`\`\`
┌─────────────────────────────────────────────────────────────────────────────┐
│ TDR-002: KYSELY AS DATABASE QUERY BUILDER                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ STATUS: ACCEPTED                                                            │
│                                                                             │
│ CONTEXT:                                                                    │
│ Prisma is explicitly prohibited. Need a type-safe database access           │
│ layer that supports PostgreSQL, schema-per-tenant, RLS, and provides        │
│ fine-grained control over SQL generation.                                   │
│                                                                             │
│ DECISION:                                                                   │
│ Adopt Kysely as the primary database query builder with type-safe           │
│ schema definitions.                                                         │
│                                                                             │
│ RATIONALE:                                                                  │
│ ┌───────────────────────────────────────────────────────────────────────┐  │
│ │ Criterion          │ Kysely    │ Drizzle   │ Knex      │ Raw SQL    │  │
│ ├────────────────────┼───────────┼───────────┼───────────┼────────────┤  │
│ │ Type safety        │   ★★★★★   │  ★★★★★    │   ★★★     │    ★       │  │
│ │ SQL-like syntax    │   ★★★★★   │  ★★★★     │   ★★★★    │   ★★★★★   │  │
│ │ Schema flexibility │   ★★★★★   │  ★★★★     │   ★★★★    │   ★★★★★   │  │
│ │ RLS support        │   ★★★★★   │  ★★★★     │   ★★★★    │   ★★★★★   │  │
│ │ Multi-schema       │   ★★★★★   │  ★★★      │   ★★★★    │   ★★★★★   │  │
│ │ Migration tooling  │   ★★★★    │  ★★★★★    │   ★★★★★   │    ★★     │  │
│ │ Bundle size        │   ★★★★★   │  ★★★★     │   ★★★     │   ★★★★★   │  │
│ └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│ KEY ADVANTAGES FOR SEUMEI:                                                  │
│ + Excellent schema-per-tenant support via withSchema()                      │
│ + Full control over SQL for RLS policy management                           │
│ + No ORM magic - explicit queries                                           │
│ + Compile-time type checking for queries                                    │
│ + Small bundle size (~12KB gzipped)                                         │
│                                                                             │
│ CONSEQUENCES:                                                               │
│ + Predictable query execution                                               │
│ + Easy debugging (SQL is transparent)                                       │
│ + Works well with connection pooling                                        │
│ - Manual migration management (use custom migrator)                         │
│ - No automatic relation handling (explicit joins required)                  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
\`\`\`

#### TDR-003: Schema-per-Tenant with RLS

\`\`\`
┌─────────────────────────────────────────────────────────────────────────────┐
│ TDR-003: SCHEMA-PER-TENANT WITH RLS ISOLATION                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ STATUS: ACCEPTED                                                            │
│                                                                             │
│ CONTEXT:                                                                    │
│ Multi-tenancy is the core of SEUMEI. Need to balance isolation,             │
│ scalability, operational simplicity, and cost. Three main approaches:       │
│ 1. Shared tables with tenant_id                                             │
│ 2. Schema-per-tenant                                                        │
│ 3. Database-per-tenant                                                      │
│                                                                             │
│ DECISION:                                                                   │
│ Implement Schema-per-tenant with RLS as secondary protection layer.         │
│                                                                             │
│ DETAILED COMPARISON:                                                        │
│ ┌───────────────────────────────────────────────────────────────────────┐  │
│ │                                                                        │  │
│ │  APPROACH 1: SHARED TABLES (tenant_id column)                         │  │
│ │  ┌────────────────────────────────────────────────────────────────┐   │  │
│ │  │ + Simple migrations                                             │   │  │
│ │  │ + Easy cross-tenant queries (admin)                             │   │  │
│ │  │ + Lower resource usage                                          │   │  │
│ │  │ - Risk of data leakage if WHERE clause forgotten                │   │  │
│ │  │ - Index bloat affects all tenants                               │   │  │
│ │  │ - Noisy neighbor problem                                        │   │  │
│ │  │ - Harder to comply with data residency requirements             │   │  │
│ │  └────────────────────────────────────────────────────────────────┘   │  │
│ │                                                                        │  │
│ │  APPROACH 2: SCHEMA-PER-TENANT (SELECTED)                             │  │
│ │  ┌────────────────────────────────────────────────────────────────┐   │  │
│ │  │ + Strong isolation at database level                            │   │  │
│ │  │ + Independent vacuum/analyze per tenant                         │   │  │
│ │  │ + Easy tenant data export/deletion (LGPD)                       │   │  │
│ │  │ + Per-tenant performance tuning possible                        │   │  │
│ │  │ + Schema can be moved to separate database if needed            │   │  │
│ │  │ + RLS adds defense-in-depth                                     │   │  │
│ │  │ - More complex migrations (run per schema)                      │   │  │
│ │  │ - Higher connection pool requirements                           │   │  │
│ │  │ - Schema management overhead                                    │   │  │
│ │  └────────────────────────────────────────────────────────────────┘   │  │
│ │                                                                        │  │
│ │  APPROACH 3: DATABASE-PER-TENANT                                      │  │
│ │  ┌────────────────────────────────────────────────────────────────┐   │  │
│ │  │ + Maximum isolation                                             │   │  │
│ │  │ + True multi-region possible                                    │   │  │
│ │  │ - Expensive (each tenant = separate DB)                         │   │  │
│ │  │ - Complex connection management                                 │   │  │
│ │  │ - Operational nightmare at scale                                │   │  │
│ │  └────────────────────────────────────────────────────────────────┘   │  │
│ │                                                                        │  │
│ └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│ WHY SCHEMA-PER-TENANT + RLS:                                                │
│                                                                             │
│ ┌───────────────────────────────────────────────────────────────────────┐  │
│ │                                                                        │  │
│ │  1. DEFENSE IN DEPTH                                                  │  │
│ │     Schema provides logical isolation                                 │  │
│ │     RLS provides query-level enforcement                              │  │
│ │     Application provides context validation                           │  │
│ │                                                                        │  │
│ │  2. COMPLIANCE READY                                                  │  │
│ │     LGPD: Easy to delete entire tenant (DROP SCHEMA CASCADE)          │  │
│ │     Audit: Schema-level access logging                                │  │
│ │     Data residency: Schema can migrate to regional DB                 │  │
│ │                                                                        │  │
│ │  3. OPERATIONAL BENEFITS                                              │  │
│ │     Per-tenant backup/restore                                         │  │
│ │     Independent vacuum cycles                                         │  │
│ │     Isolated performance issues                                       │  │
│ │                                                                        │  │
│ │  4. SCALE PATH                                                        │  │
│ │     Start: All schemas in single Neon database                        │  │
│ │     Growth: High-value tenants get dedicated compute                  │  │
│ │     Enterprise: Full database isolation                               │  │
│ │                                                                        │  │
│ └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│ SCALING PROJECTIONS:                                                        │
│ ┌───────────────────────────────────────────────────────────────────────┐  │
│ │ Tenants    │ Schema Strategy        │ Est. Cost    │ Notes            │  │
│ ├────────────┼────────────────────────┼──────────────┼──────────────────┤  │
│ │ 0-1K       │ Single Neon DB         │ $19-50/mo    │ Launch phase     │  │
│ │ 1K-10K     │ Single DB + read rep   │ $100-300/mo  │ Growth phase     │  │
│ │ 10K-50K    │ Sharded by tenant tier │ $500-2K/mo   │ Scale phase      │  │
│ │ 50K-100K   │ Multi-DB with routing  │ $2K-5K/mo    │ Enterprise phase │  │
│ └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
\`\`\`

---

## 4. Multi-Tenancy Architecture

### 4.1 Tenancy Model

\`\`\`
┌─────────────────────────────────────────────────────────────────────────────┐
│                     MULTI-TENANCY ARCHITECTURE                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  DATABASE STRUCTURE                                                         │
│  ══════════════════                                                         │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                        PostgreSQL (Neon)                              │ │
│  │                                                                        │ │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │ │
│  │  │                     SCHEMA: _system                              │  │ │
│  │  │  (Global tables - no RLS, protected by application layer)       │  │ │
│  │  │                                                                  │  │ │
│  │  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐                │  │ │
│  │  │  │  tenants    │ │global_users │ │   plans     │                │  │ │
│  │  │  │             │ │             │ │             │                │  │ │
│  │  │  │ id          │ │ id          │ │ id          │                │  │ │
│  │  │  │ slug        │ │ clerk_id    │ │ name        │                │  │ │
│  │  │  │ name        │ │ email       │ │ price       │                │  │ │
│  │  │  │ schema_name │ │ created_at  │ │ features    │                │  │ │
│  │  │  │ plan_id     │ └─────────────┘ │ limits      │                │  │ │
│  │  │  │ status      │                 └─────────────┘                │  │ │
│  │  │  │ settings    │ ┌─────────────┐ ┌─────────────┐                │  │ │
│  │  │  │ created_at  │ │tenant_users │ │  modules    │                │  │ │
│  │  │  └─────────────┘ │             │ │             │                │  │ │
│  │  │                  │ tenant_id   │ │ id          │                │  │ │
│  │  │                  │ user_id     │ │ slug        │                │  │ │
│  │  │                  │ role        │ │ name        │                │  │ │
│  │  │                  │ permissions │ │ version     │                │  │ │
│  │  │                  └─────────────┘ │ status      │                │  │ │
│  │  │                                  └─────────────┘                │  │ │
│  │  └─────────────────────────────────────────────────────────────────┘  │ │
│  │                                                                        │ │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │ │
│  │  │              SCHEMA: tenant_acme_corp                           │  │ │
│  │  │  (Tenant-specific tables with RLS enabled)                      │  │ │
│  │  │                                                                  │  │ │
│  │  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐                │  │ │
│  │  │  │  customers  │ │  products   │ │  invoices   │                │  │ │
│  │  │  │             │ │             │ │             │                │  │ │
│  │  │  │ id          │ │ id          │ │ id          │                │  │ │
│  │  │  │ name        │ │ name        │ │ number      │                │  │ │
│  │  │  │ email       │ │ price       │ │ customer_id │                │  │ │
│  │  │  │ document    │ │ sku         │ │ total       │                │  │ │
│  │  │  │ ...         │ │ ...         │ │ ...         │                │  │ │
│  │  │  └─────────────┘ └─────────────┘ └─────────────┘                │  │ │
│  │  │                                                                  │  │ │
│  │  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐                │  │ │
│  │  │  │transactions │ │ audit_logs  │ │module_config│                │  │ │
│  │  │  └─────────────┘ └─────────────┘ └─────────────┘                │  │ │
│  │  └─────────────────────────────────────────────────────────────────┘  │ │
│  │                                                                        │ │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │ │
│  │  │              SCHEMA: tenant_beta_ltda                           │  │ │
│  │  │  (Same structure, completely isolated)                          │  │ │
│  │  │  ...                                                             │  │ │
│  │  └─────────────────────────────────────────────────────────────────┘  │ │
│  │                                                                        │ │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │ │
│  │  │              SCHEMA: tenant_gamma_mei                           │  │ │
│  │  │  (Same structure, completely isolated)                          │  │ │
│  │  │  ...                                                             │  │ │
│  │  └─────────────────────────────────────────────────────────────────┘  │ │
│  │                                                                        │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
\`\`\`

### 4.2 Tenant Resolution Flow

\`\`\`
┌─────────────────────────────────────────────────────────────────────────────┐
│                     TENANT RESOLUTION FLOW                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  REQUEST LIFECYCLE                                                          │
│  ═════════════════                                                          │
│                                                                             │
│  ┌─────────┐      ┌─────────┐      ┌─────────┐      ┌─────────┐            │
│  │ Request │─────▶│Middleware│─────▶│ Tenant  │─────▶│ Schema  │            │
│  │         │      │         │      │Resolver │      │ Selector│            │
│  └─────────┘      └─────────┘      └─────────┘      └─────────┘            │
│       │                │                │                │                  │
│       │                │                │                │                  │
│       ▼                ▼                ▼                ▼                  │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                      │   │
│  │  1. EXTRACT TENANT IDENTIFIER                                       │   │
│  │     ├── From subdomain: acme.seumei.com.br → "acme"                 │   │
│  │     ├── From header: X-Tenant-ID: tenant_xxxx                       │   │
│  │     ├── From path: /api/v1/tenant/acme/... → "acme"                 │   │
│  │     └── From session: clerk.session.tenant_id                       │   │
│  │                                                                      │   │
│  │  2. RESOLVE TENANT                                                  │   │
│  │     ├── Query _system.tenants WHERE slug = identifier               │   │
│  │     ├── Validate tenant status = 'active'                           │   │
│  │     ├── Check user belongs to tenant                                │   │
│  │     └── Load tenant configuration + plan limits                     │   │
│  │                                                                      │   │
│  │  3. SET DATABASE CONTEXT                                            │   │
│  │     ├── Set search_path to tenant schema                            │   │
│  │     ├── Set session variables for RLS                               │   │
│  │     └── Initialize Kysely with schema context                       │   │
│  │                                                                      │   │
│  │  4. EXECUTE REQUEST                                                 │   │
│  │     ├── All queries scoped to tenant schema                         │   │
│  │     ├── RLS policies enforce additional checks                      │   │
│  │     └── Audit logs written to tenant schema                         │   │
│  │                                                                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  RESOLUTION PRIORITY                                                        │
│  ═══════════════════                                                        │
│                                                                             │
│  1. Explicit header (API calls): X-Tenant-ID                               │
│  2. Subdomain (web app): {tenant}.seumei.com.br                            │
│  3. Session context (authenticated): clerk.organization.slug               │
│  4. Path parameter (webhooks): /webhooks/{tenant}/...                      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
\`\`\`

### 4.3 RLS Policy Design

\`\`\`
┌─────────────────────────────────────────────────────────────────────────────┐
│                     ROW-LEVEL SECURITY POLICIES                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  POLICY ARCHITECTURE                                                        │
│  ═══════════════════                                                        │
│                                                                             │
│  Even with schema-per-tenant, RLS adds defense-in-depth:                   │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                                                                        │ │
│  │  PURPOSE OF RLS IN SCHEMA-PER-TENANT:                                 │ │
│  │                                                                        │ │
│  │  1. USER-LEVEL ISOLATION                                              │ │
│  │     Within a tenant, restrict data by user role                       │ │
│  │     Example: Sales rep sees only their customers                      │ │
│  │                                                                        │ │
│  │  2. SOFT-DELETE ENFORCEMENT                                           │ │
│  │     Automatically filter deleted records                              │ │
│  │     No risk of forgotten WHERE clauses                                │ │
│  │                                                                        │ │
│  │  3. DATA CLASSIFICATION                                               │ │
│  │     Restrict sensitive fields based on permission level               │ │
│  │     Example: Only admins see full bank account numbers                │ │
│  │                                                                        │ │
│  │  4. TEMPORAL POLICIES                                                 │ │
│  │     Archive access restrictions                                       │ │
│  │     Fiscal year boundaries                                            │ │
│  │                                                                        │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  POLICY DEFINITIONS                                                         │
│  ══════════════════                                                         │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                                                                        │ │
│  │  POLICY: soft_delete_filter                                           │ │
│  │  TABLES: ALL tenant tables                                            │ │
│  │  ────────────────────────────────────────────────────────────────────│ │
│  │  USING: (deleted_at IS NULL)                                          │ │
│  │  WITH CHECK: (deleted_at IS NULL)                                     │ │
│  │                                                                        │ │
│  │  POLICY: user_data_ownership                                          │ │
│  │  TABLES: customers, transactions, invoices                            │ │
│  │  ────────────────────────────────────────────────────────────────────│ │
│  │  USING: (                                                             │ │
│  │    current_setting('app.user_role') = 'owner'                         │ │
│  │    OR current_setting('app.user_role') = 'admin'                      │ │
│  │    OR owner_user_id = current_setting('app.user_id')::uuid            │ │
│  │    OR owner_user_id IS NULL                                           │ │
│  │  )                                                                    │ │
│  │                                                                        │ │
│  │  POLICY: fiscal_year_boundary                                         │ │
│  │  TABLES: transactions, invoices                                       │ │
│  │  ────────────────────────────────────────────────────────────────────│ │
│  │  USING: (                                                             │ │
│  │    EXTRACT(YEAR FROM created_at) >= current_setting('app.min_year')  │ │
│  │    OR current_setting('app.user_role') IN ('owner', 'admin')         │ │
│  │  )                                                                    │ │
│  │                                                                        │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  SESSION VARIABLE SETUP                                                     │
│  ═══════════════════════                                                    │
│                                                                             │
│  Before each request, the following are set:                               │
│                                                                             │
│  SET LOCAL app.user_id = 'user_uuid';                                      │
│  SET LOCAL app.user_role = 'operator';                                     │
│  SET LOCAL app.min_year = '2023';                                          │
│  SET LOCAL app.permissions = '["read", "write"]';                          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
\`\`\`

### 4.4 Schema Lifecycle Management

\`\`\`
┌─────────────────────────────────────────────────────────────────────────────┐
│                     SCHEMA LIFECYCLE MANAGEMENT                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  TENANT PROVISIONING                                                        │
│  ═══════════════════                                                        │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                      │   │
│  │  1. CREATE TENANT RECORD                                            │   │
│  │     ┌────────────────────────────────────────────────────────────┐  │   │
│  │     │ INSERT INTO _system.tenants (slug, name, plan_id, ...)    │  │   │
│  │     │ schema_name = 'tenant_' + slug                             │  │   │
│  │     └────────────────────────────────────────────────────────────┘  │   │
│  │                                                                      │   │
│  │  2. CREATE SCHEMA (via Inngest background job)                      │   │
│  │     ┌────────────────────────────────────────────────────────────┐  │   │
│  │     │ CREATE SCHEMA tenant_acme;                                  │  │   │
│  │     │ SET search_path TO tenant_acme;                            │  │   │
│  │     └────────────────────────────────────────────────────────────┘  │   │
│  │                                                                      │   │
│  │  3. RUN MIGRATIONS                                                  │   │
│  │     ┌────────────────────────────────────────────────────────────┐  │   │
│  │     │ Execute all migrations in schema context                   │  │   │
│  │     │ CREATE TABLE tenant_acme.customers (...)                   │  │   │
│  │     │ CREATE TABLE tenant_acme.invoices (...)                    │  │   │
│  │     └────────────────────────────────────────────────────────────┘  │   │
│  │                                                                      │   │
│  │  4. ENABLE RLS                                                      │   │
│  │     ┌────────────────────────────────────────────────────────────┐  │   │
│  │     │ ALTER TABLE tenant_acme.customers ENABLE ROW LEVEL SECURITY│  │   │
│  │     │ CREATE POLICY ... ON tenant_acme.customers ...             │  │   │
│  │     └────────────────────────────────────────────────────────────┘  │   │
│  │                                                                      │   │
│  │  5. SEED DEFAULT DATA                                               │   │
│  │     ┌────────────────────────────────────────────────────────────┐  │   │
│  │     │ Insert default categories, settings, etc.                  │  │   │
│  │     └────────────────────────────────────────────────────────────┘  │   │
│  │                                                                      │   │
│  │  6. UPDATE STATUS                                                   │   │
│  │     ┌────────────────────────────────────────────────────────────┐  │   │
│  │     │ UPDATE _system.tenants SET status = 'active'               │  │   │
│  │     └────────────────────────────────────────────────────────────┘  │   │
│  │                                                                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  TENANT DEPROVISIONING (LGPD Compliant)                                    │
│  ═══════════════════════════════════════                                    │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                      │   │
│  │  1. SOFT DELETE (30-day retention)                                  │   │
│  │     UPDATE _system.tenants SET status = 'pending_deletion'          │   │
│  │                                                                      │   │
│  │  2. DISABLE ACCESS                                                  │   │
│  │     Tenant resolution returns 'disabled' status                     │   │
│  │                                                                      │   │
│  │  3. EXPORT DATA (if requested)                                      │   │
│  │     Generate full tenant data export                                │   │
│  │                                                                      │   │
│  │  4. HARD DELETE (after retention period)                            │   │
│  │     DROP SCHEMA tenant_acme CASCADE;                                │   │
│  │     DELETE FROM _system.tenants WHERE slug = 'acme';                │   │
│  │                                                                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
\`\`\`

---

## 5. System Architecture

### 5.1 High-Level Architecture

\`\`\`
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    SEUMEI SYSTEM ARCHITECTURE                                            │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                          │
│  EXTERNAL ACTORS                                                                                         │
│  ═══════════════                                                                                         │
│                                                                                                          │
│  ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐                      │
│  │   MEI   │   │ Partner │   │  Admin  │   │ Webhook │   │External │   │Satellite│                      │
│  │  User   │   │   App   │   │  Staff  │   │ Sources │   │   API   │   │  Apps   │                      │
│  └────┬────┘   └────┬────┘   └────┬────┘   └────┬────┘   └────┬────┘   └────┬────┘                      │
│       │             │             │             │             │             │                            │
│       └─────────────┴─────────────┴─────────────┴─────────────┴─────────────┘                            │
│                                           │                                                              │
│  ═══════════════════════════════════════════════════════════════════════════════════════════════════════│
│                                           │                                                              │
│  EDGE LAYER                               ▼                                                              │
│  ══════════                     ┌───────────────────┐                                                    │
│                                 │   Vercel Edge     │                                                    │
│                                 │   ┌───────────┐   │                                                    │
│                                 │   │   CDN     │   │                                                    │
│                                 │   │   WAF     │   │                                                    │
│                                 │   │   DDoS    │   │                                                    │
│                                 │   └───────────┘   │                                                    │
│                                 └─────────┬─────────┘                                                    │
│                                           │                                                              │
│  ═══════════════════════════════════════════════════════════════════════════════════════════════════════│
│                                           │                                                              │
│  APPLICATION LAYER                        ▼                                                              │
│  ═════════════════      ┌─────────────────────────────────────────────────────────────┐                 │
│                         │                    NEXT.JS 15 APPLICATION                    │                 │
│                         │                                                              │                 │
│                         │  ┌────────────────────────────────────────────────────────┐ │                 │
│                         │  │                   MIDDLEWARE LAYER                      │ │                 │
│                         │  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │ │                 │
│                         │  │  │  Auth    │ │ Tenant   │ │  Rate    │ │  Audit   │  │ │                 │
│                         │  │  │  Check   │ │ Resolver │ │  Limit   │ │  Logger  │  │ │                 │
│                         │  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │ │                 │
│                         │  └────────────────────────────────────────────────────────┘ │                 │
│                         │                              │                               │                 │
│                         │        ┌─────────────────────┼─────────────────────┐        │                 │
│                         │        │                     │                     │        │                 │
│                         │        ▼                     ▼                     ▼        │                 │
│                         │  ┌──────────┐          ┌──────────┐          ┌──────────┐  │                 │
│                         │  │   RSC    │          │  Server  │          │   API    │  │                 │
│                         │  │  Pages   │          │ Actions  │          │  Routes  │  │                 │
│                         │  └────┬─────┘          └────┬─────┘          └────┬─────┘  │                 │
│                         │       │                     │                     │        │                 │
│                         │       └─────────────────────┼─────────────────────┘        │                 │
│                         │                             │                               │                 │
│                         │                             ▼                               │                 │
│                         │  ┌────────────────────────────────────────────────────────┐ │                 │
│                         │  │                    SERVICE LAYER                        │ │                 │
│                         │  │  ┌──────────────────────────────────────────────────┐  │ │                 │
│                         │  │  │                 MODULE ENGINE                     │  │ │                 │
│                         │  │  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐    │  │ │                 │
│                         │  │  │  │  Core  │ │Finance │ │  NFe   │ │  PIX   │    │  │ │                 │
│                         │  │  │  │ Module │ │ Module │ │ Module │ │ Module │    │  │ │                 │
│                         │  │  │  └────────┘ └────────┘ └────────┘ └────────┘    │  │ │                 │
│                         │  │  └──────────────────────────────────────────────────┘  │ │                 │
│                         │  │                             │                           │ │                 │
│                         │  │  ┌──────────────────────────┼──────────────────────┐   │ │                 │
│                         │  │  │                          │                      │   │ │                 │
│                         │  │  │  ┌────────────┐   ┌──────▼─────┐   ┌─────────┐ │   │ │                 │
│                         │  │  │  │   Auth     │   │  Tenant    │   │  Event  │ │   │ │                 │
│                         │  │  │  │  Service   │   │  Service   │   │  Bus    │ │   │ │                 │
│                         │  │  │  └────────────┘   └────────────┘   └─────────┘ │   │ │                 │
│                         │  │  │                                                 │   │ │                 │
│                         │  │  └─────────────────────────────────────────────────┘   │ │                 │
│                         │  └────────────────────────────────────────────────────────┘ │                 │
│                         └──────────────────────────────┬───────────────────────────────┘                 │
│                                                        │                                                 │
│  ═══════════════════════════════════════════════════════════════════════════════════════════════════════│
│                                                        │                                                 │
│  DATA LAYER                                            ▼                                                 │
│  ══════════          ┌─────────────────────────────────────────────────────────────────┐                │
│                      │                         DATA ACCESS LAYER                        │                │
│                      │                                                                  │                │
│                      │  ┌────────────────────────────────────────────────────────────┐ │                │
│                      │  │                      REPOSITORY LAYER                       │ │                │
│                      │  │                                                             │ │                │
│                      │  │   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐      │ │                │
│                      │  │   │  Customer   │   │  Invoice    │   │Transaction  │      │ │                │
│                      │  │   │ Repository  │   │ Repository  │   │ Repository  │      │ │                │
│                      │  │   └─────────────┘   └─────────────┘   └─────────────┘      │ │                │
│                      │  │                                                             │ │                │
│                      │  └────────────────────────────────────────────────────────────┘ │                │
│                      │                              │                                   │                │
│                      │                              ▼                                   │                │
│                      │  ┌────────────────────────────────────────────────────────────┐ │                │
│                      │  │                     KYSELY QUERY LAYER                      │ │                │
│                      │  │                                                             │ │                │
│                      │  │   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐      │ │                │
│                      │  │   │   Schema    │   │   Query     │   │  Migration  │      │ │                │
│                      │  │   │   Router    │   │   Builder   │   │   Runner    │      │ │                │
│                      │  │   └─────────────┘   └─────────────┘   └─────────────┘      │ │                │
│                      │  │                                                             │ │                │
│                      │  └────────────────────────────────────────────────────────────┘ │                │
│                      └─────────────────────────────────────────────────────────────────┘                │
│                                                        │                                                 │
│  ═══════════════════════════════════════════════════════════════════════════════════════════════════════│
│                                                        │                                                 │
│  INFRASTRUCTURE LAYER                                  ▼                                                 │
│  ════════════════════                                                                                    │
│                                                                                                          │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐                 │
│  │                  │  │                  │  │                  │  │                  │                 │
│  │   PostgreSQL     │  │  Upstash Redis   │  │     Inngest      │  │   Vercel Blob    │                 │
│  │     (Neon)       │  │                  │  │                  │  │                  │                 │
│  │                  │  │  ┌────────────┐  │  │  ┌────────────┐  │  │  ┌────────────┐  │                 │
│  │  ┌────────────┐  │  │  │   Cache    │  │  │  │  Workflows │  │  │  │   Files    │  │                 │
│  │  │  _system   │  │  │  │   Layer    │  │  │  │   Engine   │  │  │  │  Storage   │  │                 │
│  │  │   schema   │  │  │  └────────────┘  │  │  └────────────┘  │  │  └────────────┘  │                 │
│  │  └────────────┘  │  │                  │  │                  │  │                  │                 │
│  │  ┌────────────┐  │  │  ┌────────────┐  │  │  ┌────────────┐  │  │  ┌────────────┐  │                 │
│  │  │  tenant_*  │  │  │  │  Pub/Sub   │  │  │  │   Cron     │  │  │  │  Documents │  │                 │
│  │  │  schemas   │  │  │  │  Realtime  │  │  │  │   Jobs     │  │  │  │   (PDF)    │  │                 │
│  │  └────────────┘  │  │  └────────────┘  │  │  └────────────┘  │  │  └────────────┘  │                 │
│  │                  │  │                  │  │                  │  │                  │                 │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘  └──────────────────┘                 │
│                                                                                                          │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐                 │
│  │                  │  │                  │  │                  │  │                  │                 │
│  │      Clerk       │  │     Stripe       │  │     Resend       │  │ External APIs    │                 │
│  │                  │  │                  │  │                  │  │                  │                 │
│  │  ┌────────────┐  │  │  ┌────────────┐  │  │  ┌────────────┐  │  │  ┌────────────┐  │                 │
│  │  │    Auth    │  │  │  │  Billing   │  │  │  │   Email    │  │  │  │   SEFAZ    │  │                 │
│  │  │   + MFA    │  │  │  │ Subscript. │  │  │  │  Delivery  │  │  │  │   + PSPs   │  │                 │
│  │  └────────────┘  │  │  └────────────┘  │  │  └────────────┘  │  │  └────────────┘  │                 │
│  │                  │  │                  │  │                  │  │                  │                 │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘  └──────────────────┘                 │
│                                                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────┘
\`\`\`

### 5.2 Component Interaction Diagram

\`\`\`
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                          COMPONENT INTERACTION DIAGRAM                                   │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  REQUEST FLOW EXAMPLE: Create Invoice                                                   │
│  ════════════════════════════════════                                                   │
│                                                                                          │
│  ┌─────────┐                                                                            │
│  │  User   │                                                                            │
│  │ Browser │                                                                            │
│  └────┬────┘                                                                            │
│       │                                                                                  │
│       │ 1. Form Submit (Server Action)                                                  │
│       ▼                                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐   │
│  │                              MIDDLEWARE CHAIN                                    │   │
│  │                                                                                  │   │
│  │  ┌────────┐    ┌────────┐    ┌────────┐    ┌────────┐    ┌────────┐            │   │
│  │  │  Auth  │───▶│ Tenant │───▶│  Rate  │───▶│ Perms  │───▶│ Audit  │            │   │
│  │  │ Verify │    │Resolve │    │ Limit  │    │ Check  │    │  Log   │            │   │
│  │  └────────┘    └────────┘    └────────┘    └────────┘    └────────┘            │   │
│  │                                                                                  │   │
│  └──────────────────────────────────┬──────────────────────────────────────────────┘   │
│                                     │                                                   │
│       │ 2. Server Action Execution  │                                                   │
│       ▼                             ▼                                                   │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐   │
│  │                           SERVER ACTION: createInvoice                           │   │
│  │                                                                                  │   │
│  │  ┌──────────────────────────────────────────────────────────────────────────┐   │   │
│  │  │  3. Input Validation (Zod Schema)                                        │   │   │
│  │  └──────────────────────────────────────────────────────────────────────────┘   │   │
│  │                                      │                                          │   │
│  │                                      ▼                                          │   │
│  │  ┌──────────────────────────────────────────────────────────────────────────┐   │   │
│  │  │  4. Call Invoice Service                                                 │   │   │
│  │  │     invoiceService.create(tenantContext, validatedData)                  │   │   │
│  │  └──────────────────────────────────────────────────────────────────────────┘   │   │
│  │                                                                                  │   │
│  └──────────────────────────────────┬──────────────────────────────────────────────┘   │
│                                     │                                                   │
│       │ 5. Service Layer            │                                                   │
│       ▼                             ▼                                                   │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐   │
│  │                              INVOICE SERVICE                                     │   │
│  │                                                                                  │   │
│  │  ┌──────────────────────────────────────────────────────────────────────────┐   │   │
│  │  │  6. Business Logic                                                       │   │   │
│  │  │     - Calculate totals                                                   │   │   │
│  │  │     - Generate invoice number                                            │   │   │
│  │  │     - Apply discounts                                                    │   │   │
│  │  └──────────────────────────────────────────────────────────────────────────┘   │   │
│  │                                      │                                          │   │
│  │                                      ▼                                          │   │
│  │  ┌──────────────────────────────────────────────────────────────────────────┐   │   │
│  │  │  7. Repository Call (with tenant context)                                │   │   │
│  │  │     invoiceRepository.insert(invoice)                                    │   │   │
│  │  └──────────────────────────────────────────────────────────────────────────┘   │   │
│  │                                      │                                          │   │
│  │                                      ▼                                          │   │
│  │  ┌──────────────────────────────────────────────────────────────────────────┐   │   │
│  │  │  8. Emit Domain Event                                                    │   │   │
│  │  │     eventBus.emit('invoice.created', invoice)                            │   │   │
│  │  └──────────────────────────────────────────────────────────────────────────┘   │   │
│  │                                                                                  │   │
│  └──────────────────────────────────┬──────────────────────────────────────────────┘   │
│                                     │                                                   │
│       │ 9. Database Write           │                                                   │
│       ▼                             ▼                                                   │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐   │
│  │                           KYSELY (Tenant Schema)                                 │   │
│  │                                                                                  │   │
│  │  db.withSchema('tenant_acme')                                                   │   │
│  │    .insertInto('invoices')                                                      │   │
│  │    .values(invoice)                                                             │   │
│  │    .returning(['id', 'number', 'total'])                                        │   │
│  │    .executeTakeFirstOrThrow()                                                   │   │
│  │                                                                                  │   │
│  └──────────────────────────────────┬──────────────────────────────────────────────┘   │
│                                     │                                                   │
│       │ 10. Async Workflows         │                                                   │
│       ▼                             ▼                                                   │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐   │
│  │                              INNGEST WORKFLOWS                                   │   │
│  │                                                                                  │   │
│  │  Event: invoice.created                                                         │   │
│  │  ┌──────────────────────────────────────────────────────────────────────────┐   │   │
│  │  │  Step 1: Generate PDF                                                    │   │   │
│  │  │  Step 2: Upload to Blob Storage                                          │   │   │
│  │  │  Step 3: Send Email Notification                                         │   │   │
│  │  │  Step 4: Create Audit Log                                                │   │   │
│  │  │  Step 5: (if PIX enabled) Generate QR Code                               │   │   │
│  │  └──────────────────────────────────────────────────────────────────────────┘   │   │
│  │                                                                                  │   │
│  └─────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘
\`\`\`

---

## 6. Monorepo Structure

### 6.1 Complete Folder Architecture

\`\`\`
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                              SEUMEI MONOREPO STRUCTURE                                   │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  seumei/                                                                                │
│  │                                                                                       │
│  ├── .github/                          # CI/CD Configuration                            │
│  │   ├── workflows/                                                                     │
│  │   │   ├── ci.yml                    # Lint, type-check, test                        │
│  │   │   ├── preview.yml               # PR preview deployments                        │
│  │   │   ├── production.yml            # Production deployment                         │
│  │   │   ├── migrations.yml            # Database migration automation                 │
│  │   │   └── security.yml              # Security scanning                             │
│  │   ├── CODEOWNERS                    # Code ownership rules                          │
│  │   └── pull_request_template.md                                                      │
│  │                                                                                       │
│  ├── apps/                             # Deployable Applications                        │
│  │   │                                                                                  │
│  │   ├── web/                          # Main SEUMEI Dashboard                         │
│  │   │   ├── app/                      # Next.js App Router                            │
│  │   │   │   ├── (auth)/               # Auth route group                              │
│  │   │   │   │   ├── login/                                                            │
│  │   │   │   │   ├── register/                                                         │
│  │   │   │   │   ├── forgot-password/                                                  │
│  │   │   │   │   └── layout.tsx                                                        │
│  │   │   │   │                                                                          │
│  │   │   │   ├── (dashboard)/          # Protected dashboard routes                    │
│  │   │   │   │   ├── [tenant]/         # Tenant-scoped routes                          │
│  │   │   │   │   │   ├── page.tsx      # Dashboard home                               │
│  │   │   │   │   │   ├── customers/                                                    │
│  │   │   │   │   │   │   ├── page.tsx                                                  │
│  │   │   │   │   │   │   ├── [id]/                                                     │
│  │   │   │   │   │   │   └── new/                                                      │
│  │   │   │   │   │   ├── invoices/                                                     │
│  │   │   │   │   │   ├── products/                                                     │
│  │   │   │   │   │   ├── transactions/                                                 │
│  │   │   │   │   │   ├── reports/                                                      │
│  │   │   │   │   │   ├── settings/                                                     │
│  │   │   │   │   │   │   ├── page.tsx                                                  │
│  │   │   │   │   │   │   ├── profile/                                                  │
│  │   │   │   │   │   │   ├── team/                                                     │
│  │   │   │   │   │   │   ├── billing/                                                  │
│  │   │   │   │   │   │   ├── modules/                                                  │
│  │   │   │   │   │   │   └── integrations/                                             │
│  │   │   │   │   │   └── modules/      # Dynamic module routes                         │
│  │   │   │   │   │       └── [module]/ # Loaded from module engine                     │
│  │   │   │   │   └── layout.tsx        # Dashboard shell                              │
│  │   │   │   │                                                                          │
│  │   │   │   ├── (marketing)/          # Public marketing pages                        │
│  │   │   │   │   ├── page.tsx          # Landing page                                 │
│  │   │   │   │   ├── pricing/                                                          │
│  │   │   │   │   ├── features/                                                         │
│  │   │   │   │   └── layout.tsx                                                        │
│  │   │   │   │                                                                          │
│  │   │   │   ├── (public)/             # Public tenant pages                           │
│  │   │   │   │   ├── pay/              # Payment pages                                 │
│  │   │   │   │   │   └── [invoiceId]/                                                  │
│  │   │   │   │   └── layout.tsx                                                        │
│  │   │   │   │                                                                          │
│  │   │   │   ├── api/                  # API Routes                                    │
│  │   │   │   │   ├── v1/                                                               │
│  │   │   │   │   │   └── [[...route]]/                                                 │
│  │   │   │   │   │       └── route.ts  # Universal API router                         │
│  │   │   │   │   ├── webhooks/                                                         │
│  │   │   │   │   │   ├── clerk/                                                        │
│  │   │   │   │   │   ├── stripe/                                                       │
│  │   │   │   │   │   ├── inngest/                                                      │
│  │   │   │   │   │   └── [tenant]/     # Tenant-specific webhooks                     │
│  │   │   │   │   │       ├── pix/                                                      │
│  │   │   │   │   │       └── nfe/                                                      │
│  │   │   │   │   └── health/           # Health check endpoint                         │
│  │   │   │   │                                                                          │
│  │   │   │   ├── layout.tsx                                                            │
│  │   │   │   ├── globals.css                                                           │
│  │   │   │   ├── not-found.tsx                                                         │
│  │   │   │   └── error.tsx                                                             │
│  │   │   │                                                                              │
│  │   │   ├── components/               # App-specific components                       │
│  │   │   │   ├── layouts/                                                              │
│  │   │   │   │   ├── dashboard-shell.tsx                                               │
│  │   │   │   │   ├── auth-layout.tsx                                                   │
│  │   │   │   │   └── marketing-layout.tsx                                              │
│  │   │   │   ├── features/                                                             │
│  │   │   │   │   ├── customers/                                                        │
│  │   │   │   │   ├── invoices/                                                         │
│  │   │   │   │   └── settings/                                                         │
│  │   │   │   └── providers/                                                            │
│  │   │   │       ├── tenant-provider.tsx                                               │
│  │   │   │       ├── auth-provider.tsx                                                 │
│  │   │   │       └── theme-provider.tsx                                                │
│  │   │   │                                                                              │
│  │   │   ├── lib/                      # App utilities                                 │
│  │   │   │   ├── actions/              # Server Actions                                │
│  │   │   │   │   ├── customers.ts                                                      │
│  │   │   │   │   ├── invoices.ts                                                       │
│  │   │   │   │   └── settings.ts                                                       │
│  │   │   │   └── hooks/                # Client hooks                                  │
│  │   │   │                                                                              │
│  │   │   ├── next.config.ts                                                            │
│  │   │   ├── tailwind.config.ts                                                        │
│  │   │   ├── tsconfig.json                                                             │
│  │   │   └── package.json                                                              │
│  │   │                                                                                  │
│  │   ├── admin/                        # Internal Admin Panel                          │
│  │   │   └── ...                       # Similar structure                             │
│  │   │                                                                                  │
│  │   └── docs/                         # Documentation Site                            │
│  │       └── ...                       # MDX-based docs                                │
│  │                                                                                       │
│  ├── packages/                         # Shared Packages                                │
│  │   │                                                                                  │
│  │   ├── core/                         # Core Business Logic                           │
│  │   │   ├── src/                                                                      │
│  │   │   │   ├── domain/               # Domain models and logic                       │
│  │   │   │   │   ├── customer/                                                         │
│  │   │   │   │   │   ├── customer.entity.ts                                            │
│  │   │   │   │   │   ├── customer.service.ts                                           │
│  │   │   │   │   │   ├── customer.repository.ts (interface)                            │
│  │   │   │   │   │   ├── customer.events.ts                                            │
│  │   │   │   │   │   └── index.ts                                                      │
│  │   │   │   │   ├── invoice/                                                          │
│  │   │   │   │   ├── product/                                                          │
│  │   │   │   │   ├── transaction/                                                      │
│  │   │   │   │   └── index.ts                                                          │
│  │   │   │   │                                                                          │
│  │   │   │   ├── application/          # Application services                          │
│  │   │   │   │   ├── use-cases/                                                        │
│  │   │   │   │   │   ├── create-invoice.ts                                             │
│  │   │   │   │   │   ├── process-payment.ts                                            │
│  │   │   │   │   │   └── ...                                                           │
│  │   │   │   │   └── services/                                                         │
│  │   │   │   │       ├── billing.service.ts                                            │
│  │   │   │   │       └── notification.service.ts                                       │
│  │   │   │   │                                                                          │
│  │   │   │   ├── shared/               # Shared kernel                                 │
│  │   │   │   │   ├── money.value-object.ts                                             │
│  │   │   │   │   ├── document.value-object.ts                                          │
│  │   │   │   │   ├── email.value-object.ts                                             │
│  │   │   │   │   └── result.ts                                                         │
│  │   │   │   │                                                                          │
│  │   │   │   └── index.ts                                                              │
│  │   │   ├── package.json                                                              │
│  │   │   └── tsconfig.json                                                             │
│  │   │                                                                                  │
│  │   ├── database/                     # Database Package                              │
│  │   │   ├── src/                                                                      │
│  │   │   │   ├── client/                                                               │
│  │   │   │   │   ├── kysely.ts         # Kysely client factory                        │
│  │   │   │   │   ├── tenant-client.ts  # Tenant-scoped client                         │
│  │   │   │   │   └── system-client.ts  # System schema client                         │
│  │   │   │   │                                                                          │
│  │   │   │   ├── schema/               # Type definitions                              │
│  │   │   │   │   ├── system/           # _system schema types                          │
│  │   │   │   │   │   ├── tenants.ts                                                    │
│  │   │   │   │   │   ├── users.ts                                                      │
│  │   │   │   │   │   ├── plans.ts                                                      │
│  │   │   │   │   │   └── index.ts                                                      │
│  │   │   │   │   ├── tenant/           # Tenant schema types                           │
│  │   │   │   │   │   ├── customers.ts                                                  │
│  │   │   │   │   │   ├── invoices.ts                                                   │
│  │   │   │   │   │   ├── products.ts                                                   │
│  │   │   │   │   │   └── index.ts                                                      │
│  │   │   │   │   └── index.ts                                                          │
│  │   │   │   │                                                                          │
│  │   │   │   ├── repositories/         # Repository implementations                    │
│  │   │   │   │   ├── customer.repository.ts                                            │
│  │   │   │   │   ├── invoice.repository.ts                                             │
│  │   │   │   │   └── index.ts                                                          │
│  │   │   │   │                                                                          │
│  │   │   │   ├── migrations/           # SQL migrations                                │
│  │   │   │   │   ├── system/           # _system schema migrations                     │
│  │   │   │   │   │   ├── 0001_create_tenants.sql                                       │
│  │   │   │   │   │   ├── 0002_create_users.sql                                         │
│  │   │   │   │   │   └── ...                                                           │
│  │   │   │   │   ├── tenant/           # Tenant schema template                        │
│  │   │   │   │   │   ├── 0001_create_customers.sql                                     │
│  │   │   │   │   │   ├── 0002_create_products.sql                                      │
│  │   │   │   │   │   ├── 0003_create_invoices.sql                                      │
│  │   │   │   │   │   ├── 0004_enable_rls.sql                                           │
│  │   │   │   │   │   └── ...                                                           │
│  │   │   │   │   └── runner.ts         # Migration runner                             │
│  │   │   │   │                                                                          │
│  │   │   │   ├── seeds/                # Seed data                                     │
│  │   │   │   │   ├── plans.ts                                                          │
│  │   │   │   │   └── demo-tenant.ts                                                    │
│  │   │   │   │                                                                          │
│  │   │   │   └── index.ts                                                              │
│  │   │   ├── kysely.config.ts                                                          │
│  │   │   └── package.json                                                              │
│  │   │                                                                                  │
│  │   ├── modules/                      # Module System                                 │
│  │   │   │                                                                              │
│  │   │   ├── engine/                   # Module Engine Core                            │
│  │   │   │   ├── src/                                                                  │
│  │   │   │   │   ├── registry.ts       # Module registry                              │
│  │   │   │   │   ├── loader.ts         # Dynamic module loader                        │
│  │   │   │   │   ├── manifest.ts       # Manifest parser                              │
│  │   │   │   │   ├── lifecycle.ts      # Module lifecycle hooks                       │
│  │   │   │   │   ├── permissions.ts    # Module permissions                           │
│  │   │   │   │   ├── types.ts          # Module types                                 │
│  │   │   │   │   └── index.ts                                                          │
│  │   │   │   └── package.json                                                          │
│  │   │   │                                                                              │
│  │   │   ├── core-module/              # Core Module (always enabled)                  │
│  │   │   │   ├── src/                                                                  │
│  │   │   │   │   ├── manifest.ts                                                       │
│  │   │   │   │   ├── services/                                                         │
│  │   │   │   │   ├── components/                                                       │
│  │   │   │   │   ├── routes/                                                           │
│  │   │   │   │   └── index.ts                                                          │
│  │   │   │   └── package.json                                                          │
│  │   │   │                                                                              │
│  │   │   ├── finance-module/           # Finance Module                                │
│  │   │   │   ├── src/                                                                  │
│  │   │   │   │   ├── manifest.ts                                                       │
│  │   │   │   │   ├── services/                                                         │
│  │   │   │   │   │   ├── transaction.service.ts                                        │
│  │   │   │   │   │   └── report.service.ts                                             │
│  │   │   │   │   ├── components/                                                       │
│  │   │   │   │   ├── routes/                                                           │
│  │   │   │   │   ├── migrations/                                                       │
│  │   │   │   │   └── index.ts                                                          │
│  │   │   │   └── package.json                                                          │
│  │   │   │                                                                              │
│  │   │   ├── nfe-module/               # NF-e Module                                   │
│  │   │   │   └── ...                                                                   │
│  │   │   │                                                                              │
│  │   │   ├── pix-module/               # PIX Module                                    │
│  │   │   │   └── ...                                                                   │
│  │   │   │                                                                              │
│  │   │   └── crm-module/               # CRM Module                                    │
│  │   │       └── ...                                                                   │
│  │   │                                                                                  │
│  │   ├── ui/                           # SEUMEI UI Design System                       │
│  │   │   ├── src/                                                                      │
│  │   │   │   ├── primitives/           # Base components                               │
│  │   │   │   │   ├── button/                                                           │
│  │   │   │   │   │   ├── button.tsx                                                    │
│  │   │   │   │   │   ├── button.variants.ts                                            │
│  │   │   │   │   │   └── index.ts                                                      │
│  │   │   │   │   ├── input/                                                            │
│  │   │   │   │   ├── select/                                                           │
│  │   │   │   │   └── ...                                                               │
│  │   │   │   │                                                                          │
│  │   │   │   ├── patterns/             # Composed components                           │
│  │   │   │   │   ├── data-table/                                                       │
│  │   │   │   │   ├── form-builder/                                                     │
│  │   │   │   │   ├── command-menu/                                                     │
│  │   │   │   │   ├── money-input/      # BRL currency input                           │
│  │   │   │   │   ├── document-input/   # CPF/CNPJ input                               │
│  │   │   │   │   └── ...                                                               │
│  │   │   │   │                                                                          │
│  │   │   │   ├── layouts/              # Layout components                             │
│  │   │   │   │   ├── page-header/                                                      │
│  │   │   │   │   ├── sidebar/                                                          │
│  │   │   │   │   └── ...                                                               │
│  │   │   │   │                                                                          │
│  │   │   │   ├── tokens/               # Design tokens                                 │
│  │   │   │   │   ├── colors.ts                                                         │
│  │   │   │   │   ├── typography.ts                                                     │
│  │   │   │   │   └── spacing.ts                                                        │
│  │   │   │   │                                                                          │
│  │   │   │   └── index.ts                                                              │
│  │   │   ├── tailwind.config.ts                                                        │
│  │   │   └── package.json                                                              │
│  │   │                                                                                  │
│  │   ├── api/                          # API Utilities                                 │
│  │   │   ├── src/                                                                      │
│  │   │   │   ├── router/               # API router                                    │
│  │   │   │   │   ├── router.ts                                                         │
│  │   │   │   │   ├── handler.ts                                                        │
│  │   │   │   │   └── types.ts                                                          │
│  │   │   │   ├── middleware/           # API middleware                                │
│  │   │   │   │   ├── auth.ts                                                           │
│  │   │   │   │   ├── tenant.ts                                                         │
│  │   │   │   │   ├── rate-limit.ts                                                     │
│  │   │   │   │   ├── audit.ts                                                          │
│  │   │   │   │   └── error-handler.ts                                                  │
│  │   │   │   ├── validation/           # Request validation                            │
│  │   │   │   │   └── schemas/                                                          │
│  │   │   │   └── index.ts                                                              │
│  │   │   └── package.json                                                              │
│  │   │                                                                                  │
│  │   ├── auth/                         # Authentication Package                        │
│  │   │   ├── src/                                                                      │
│  │   │   │   ├── clerk/                                                                │
│  │   │   │   │   ├── client.ts                                                         │
│  │   │   │   │   ├── middleware.ts                                                     │
│  │   │   │   │   └── webhooks.ts                                                       │
│  │   │   │   ├── permissions/                                                          │
│  │   │   │   │   ├── roles.ts                                                          │
│  │   │   │   │   ├── abilities.ts                                                      │
│  │   │   │   │   └── guards.ts                                                         │
│  │   │   │   └── index.ts                                                              │
│  │   │   └── package.json                                                              │
│  │   │                                                                                  │
│  │   ├── queue/                        # Background Jobs                               │
│  │   │   ├── src/                                                                      │
│  │   │   │   ├── inngest/                                                              │
│  │   │   │   │   ├── client.ts                                                         │
│  │   │   │   │   ├── functions/                                                        │
│  │   │   │   │   │   ├── billing/                                                      │
│  │   │   │   │   │   ├── notifications/                                                │
│  │   │   │   │   │   ├── tenant-provisioning/                                          │
│  │   │   │   │   │   └── index.ts                                                      │
│  │   │   │   │   └── middleware.ts                                                     │
│  │   │   │   └── index.ts                                                              │
│  │   │   └── package.json                                                              │
│  │   │                                                                                  │
│  │   ├── cache/                        # Caching Layer                                 │
│  │   │   ├── src/                                                                      │
│  │   │   │   ├── redis/                                                                │
│  │   │   │   │   ├── client.ts                                                         │
│  │   │   │   │   ├── patterns/                                                         │
│  │   │   │   │   │   ├── tenant-cache.ts                                               │
│  │   │   │   │   │   ├── session-cache.ts                                              │
│  │   │   │   │   │   └── rate-limit.ts                                                 │
│  │   │   │   │   └── pubsub.ts         # Real-time pub/sub                            │
│  │   │   │   └── index.ts                                                              │
│  │   │   └── package.json                                                              │
│  │   │                                                                                  │
│  │   ├── telemetry/                    # Observability                                 │
│  │   │   ├── src/                                                                      │
│  │   │   │   ├── logger.ts                                                             │
│  │   │   │   ├── metrics.ts                                                            │
│  │   │   │   ├── tracing.ts                                                            │
│  │   │   │   └── index.ts                                                              │
│  │   │   └── package.json                                                              │
│  │   │                                                                                  │
│  │   ├── integrations/                 # External Integrations                         │
│  │   │   ├── stripe/                                                                   │
│  │   │   ├── resend/                                                                   │
│  │   │   ├── sefaz/                    # NF-e integration                              │
│  │   │   └── pix/                      # PIX PSP integrations                          │
│  │   │                                                                                  │
│  │   ├── contracts/                    # Shared Contracts/Types                        │
│  │   │   ├── src/                                                                      │
│  │   │   │   ├── api/                  # API contracts                                 │
│  │   │   │   │   ├── customers.contract.ts                                             │
│  │   │   │   │   ├── invoices.contract.ts                                              │
│  │   │   │   │   └── index.ts                                                          │
│  │   │   │   ├── events/               # Event contracts                               │
│  │   │   │   │   ├── domain-events.ts                                                  │
│  │   │   │   │   └── integration-events.ts                                             │
│  │   │   │   ├── errors/               # Error types                                   │
│  │   │   │   │   └── domain-errors.ts                                                  │
│  │   │   │   └── index.ts                                                              │
│  │   │   └── package.json                                                              │
│  │   │                                                                                  │
│  │   └── config/                       # Shared Configuration                          │
│  │       ├── eslint/                                                                   │
│  │       ├── typescript/                                                               │
│  │       └── tailwind/                                                                 │
│  │                                                                                       │
│  ├── tooling/                          # Development Tooling                           │
│  │   ├── scripts/                                                                      │
│  │   │   ├── setup.sh                                                                  │
│  │   │   ├── db-migrate.ts                                                             │
│  │   │   ├── db-seed.ts                                                                │
│  │   │   ├── generate-module.ts        # Module scaffolding                           │
│  │   │   └── tenant-provision.ts       # Manual tenant provisioning                   │
│  │   └── generators/                                                                   │
│  │       └── module/                   # Module template generator                     │
│  │                                                                                       │
│  ├── turbo.json                        # Turborepo configuration                       │
│  ├── pnpm-workspace.yaml               # pnpm workspace config                         │
│  ├── package.json                      # Root package.json                             │
│  ├── .env.example                      # Environment template                          │
│  ├── .gitignore                                                                        │
│  └── README.md                                                                         │
│                                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘
\`\`\`

### 6.2 Package Dependency Graph

\`\`\`
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                           PACKAGE DEPENDENCY GRAPH                                       │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  DEPENDENCY RULES                                                                        │
│  ════════════════                                                                        │
│                                                                                          │
│  1. Apps depend on packages, never other apps                                           │
│  2. Packages can depend on other packages                                               │
│  3. Core/domain packages have NO external dependencies                                  │
│  4. Infrastructure packages implement core interfaces                                   │
│                                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐   │
│  │                                                                                  │   │
│  │                              APPS LAYER                                          │   │
│  │                                                                                  │   │
│  │       ┌───────────┐       ┌───────────┐       ┌───────────┐                     │   │
│  │       │    web    │       │   admin   │       │    docs   │                     │   │
│  │       └─────┬─────┘       └─────┬─────┘       └─────┬─────┘                     │   │
│  │             │                   │                   │                            │   │
│  │             └───────────────────┼───────────────────┘                            │   │
│  │                                 │                                                │   │
│  │                                 ▼                                                │   │
│  │  ┌─────────────────────────────────────────────────────────────────────────┐    │   │
│  │  │                         FEATURE PACKAGES                                 │    │   │
│  │  │                                                                          │    │   │
│  │  │   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐                   │    │   │
│  │  │   │   modules/  │   │   modules/  │   │   modules/  │                   │    │   │
│  │  │   │   finance   │   │     nfe     │   │     pix     │                   │    │   │
│  │  │   └──────┬──────┘   └──────┬──────┘   └──────┬──────┘                   │    │   │
│  │  │          │                 │                 │                          │    │   │
│  │  │          └─────────────────┼─────────────────┘                          │    │   │
│  │  │                            │                                             │    │   │
│  │  │                            ▼                                             │    │   │
│  │  │              ┌─────────────────────────────┐                             │    │   │
│  │  │              │      modules/engine         │                             │    │   │
│  │  │              └─────────────┬───────────────┘                             │    │   │
│  │  │                            │                                             │    │   │
│  │  └────────────────────────────┼─────────────────────────────────────────────┘    │   │
│  │                               │                                                  │   │
│  │                               ▼                                                  │   │
│  │  ┌─────────────────────────────────────────────────────────────────────────┐    │   │
│  │  │                        SERVICE PACKAGES                                  │    │   │
│  │  │                                                                          │    │   │
│  │  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │    │   │
│  │  │  │   api    │  │   auth   │  │  queue   │  │  cache   │  │telemetry │  │    │   │
│  │  │  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘  │    │   │
│  │  │       │             │             │             │             │        │    │   │
│  │  │       └─────────────┴─────────────┴─────────────┴─────────────┘        │    │   │
│  │  │                                   │                                     │    │   │
│  │  └───────────────────────────────────┼─────────────────────────────────────┘    │   │
│  │                                      │                                          │   │
│  │                                      ▼                                          │   │
│  │  ┌─────────────────────────────────────────────────────────────────────────┐    │   │
│  │  │                          CORE PACKAGES                                   │    │   │
│  │  │                                                                          │    │   │
│  │  │       ┌───────────────┐       ┌───────────────┐                         │    │   │
│  │  │       │     core      │       │   database    │                         │    │   │
│  │  │       │   (domain)    │◄──────│ (repositories)│                         │    │   │
│  │  │       └───────┬───────┘       └───────────────┘                         │    │   │
│  │  │               │                                                          │    │   │
│  │  │               ▼                                                          │    │   │
│  │  │       ┌───────────────┐       ┌───────────────┐                         │    │   │
│  │  │       │   contracts   │       │      ui       │                         │    │   │
│  │  │       │   (types)     │       │ (components)  │                         │    │   │
│  │  │       └───────────────┘       └───────────────┘                         │    │   │
│  │  │                                                                          │    │   │
│  │  └─────────────────────────────────────────────────────────────────────────┘    │   │
│  │                                                                                  │   │
│  └─────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘
\`\`\`

---

## 7. Module Engine Architecture

### 7.1 Module System Design

\`\`\`
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                              MODULE ENGINE ARCHITECTURE                                  │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  CORE CONCEPTS                                                                          │
│  ═════════════                                                                          │
│                                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐   │
│  │                                                                                  │   │
│  │  MODULE = Self-contained feature unit with:                                     │   │
│  │                                                                                  │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │   │
│  │  │  Manifest   │  │  Services   │  │ Components  │  │   Routes    │            │   │
│  │  │             │  │             │  │             │  │             │            │   │
│  │  │ - Identity  │  │ - Business  │  │ - UI parts  │  │ - Pages     │            │   │
│  │  │ - Version   │  │   logic     │  │ - Widgets   │  │ - API       │            │   │
│  │  │ - Deps      │  │ - Use cases │  │ - Forms     │  │ - Actions   │            │   │
│  │  │ - Perms     │  │             │  │             │  │             │            │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘            │   │
│  │                                                                                  │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                             │   │
│  │  │ Migrations  │  │   Events    │  │    Hooks    │                             │   │
│  │  │             │  │             │  │             │                             │   │
│  │  │ - Schema    │  │ - Emits     │  │ - onInstall │                             │   │
│  │  │ - Seed      │  │ - Listens   │  │ - onEnable  │                             │   │
│  │  │             │  │             │  │ - onUpgrade │                             │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘                             │   │
│  │                                                                                  │   │
│  └─────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                          │
│  MODULE MANIFEST CONTRACT                                                               │
│  ════════════════════════                                                               │
│                                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐   │
│  │                                                                                  │   │
│  │  ModuleManifest {                                                               │   │
│  │                                                                                  │   │
│  │    // Identity                                                                  │   │
│  │    slug: string                      // Unique identifier                       │   │
│  │    name: string                      // Display name                            │   │
│  │    description: string               // Short description                       │   │
│  │    version: SemVer                   // Semantic version                        │   │
│  │    icon: LucideIcon                  // Icon component                          │   │
│  │    category: ModuleCategory          // Grouping                                │   │
│  │                                                                                  │   │
│  │    // Requirements                                                              │   │
│  │    requiredPlan: PlanTier            // Minimum plan required                   │   │
│  │    dependencies: ModuleSlug[]        // Required modules                        │   │
│  │    conflicts: ModuleSlug[]           // Incompatible modules                    │   │
│  │    requiredEnvVars: string[]         // Required environment vars               │   │
│  │                                                                                  │   │
│  │    // Permissions                                                               │   │
│  │    permissions: {                                                               │   │
│  │      key: string                                                                │   │
│  │      name: string                                                               │   │
│  │      description: string                                                        │   │
│  │      defaultRoles: Role[]                                                       │   │
│  │    }[]                                                                          │   │
│  │                                                                                  │   │
│  │    // Navigation                                                                │   │
│  │    navigation: {                                                                │   │
│  │      main: NavItem[]                 // Main sidebar items                      │   │
│  │      settings: NavItem[]             // Settings section items                  │   │
│  │    }                                                                            │   │
│  │                                                                                  │   │
│  │    // Routes                                                                    │   │
│  │    routes: {                                                                    │   │
│  │      path: string                                                               │   │
│  │      component: ComponentRef                                                    │   │
│  │      permissions: string[]                                                      │   │
│  │    }[]                                                                          │   │
│  │                                                                                  │   │
│  │    // API                                                                       │   │
│  │    api: {                                                                       │   │
│  │      routes: APIRouteDefinition[]                                               │   │
│  │      webhooks: WebhookDefinition[]                                              │   │
│  │    }                                                                            │   │
│  │                                                                                  │   │
│  │    // Database                                                                  │   │
│  │    database: {                                                                  │   │
│  │      tables: string[]                // Tables owned by module                  │   │
│  │      migrations: MigrationPath[]     // Migration files                         │   │
│  │    }                                                                            │   │
│  │                                                                                  │   │
│  │    // Extension Points                                                          │   │
│  │    extends: {                                                                   │   │
│  │      dashboardWidgets: WidgetDefinition[]                                       │   │
│  │      invoiceActions: ActionDefinition[]                                         │   │
│  │      customerProfile: ProfileExtension[]                                        │   │
│  │      settingsSections: SettingsSection[]                                        │   │
│  │    }                                                                            │   │
│  │                                                                                  │   │
│  │    // Events                                                                    │   │
│  │    events: {                                                                    │   │
│  │      emits: EventDefinition[]        // Events this module produces             │   │
│  │      listens: EventHandler[]         // Events this module handles              │   │
│  │    }                                                                            │   │
│  │                                                                                  │   │
│  │    // Lifecycle                                                                 │   │
│  │    hooks: {                                                                     │   │
│  │      onInstall: AsyncHook                                                       │   │
│  │      onUninstall: AsyncHook                                                     │   │
│  │      onEnable: AsyncHook                                                        │   │
│  │      onDisable: AsyncHook                                                       │   │
│  │      onUpgrade: (from: string, to: string) => AsyncHook                        │   │
│  │    }                                                                            │   │
│  │  }                                                                              │   │
│  │                                                                                  │   │
│  └─────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                          │
│  MODULE LIFECYCLE                                                                       │
│  ════════════════                                                                       │
│                                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐   │
│  │                                                                                  │   │
│  │                           ┌──────────────┐                                      │   │
│  │                           │  AVAILABLE   │                                      │   │
│  │                           │  (in store)  │                                      │   │
│  │                           └──────┬───────┘                                      │   │
│  │                                  │                                              │   │
│  │                                  │ tenant.installModule()                       │   │
│  │                                  ▼                                              │   │
│  │                           ┌──────────────┐                                      │   │
│  │                           │  INSTALLING  │──────┐                               │   │
│  │                           │              │      │ failure                       │   │
│  │                           └──────┬───────┘      │                               │   │
│  │                                  │              ▼                               │   │
│  │                    success       │        ┌──────────────┐                      │   │
│  │                                  │        │    FAILED    │                      │   │
│  │                                  │        └──────────────┘                      │   │
│  │                                  ▼                                              │   │
│  │                           ┌──────────────┐                                      │   │
│  │              ┌───────────▶│   ENABLED    │◀───────────┐                         │   │
│  │              │            │   (active)   │            │                         │   │
│  │              │            └──────┬───────┘            │                         │   │
│  │              │                   │                    │                         │   │
│  │              │ enable()          │ disable()         │ enable()                │   │
│  │              │                   ▼                    │                         │   │
│  │              │            ┌──────────────┐            │                         │   │
│  │              └────────────│   DISABLED   │────────────┘                         │   │
│  │                           │  (inactive)  │                                      │   │
│  │                           └──────┬───────┘                                      │   │
│  │                                  │                                              │   │
│  │                                  │ uninstall()                                  │   │
│  │                                  ▼                                              │   │
│  │                           ┌──────────────┐                                      │   │
│  │                           │ UNINSTALLING │                                      │   │
│  │                           │  (cleanup)   │                                      │   │
│  │                           └──────┬───────┘                                      │   │
│  │                                  │                                              │   │
│  │                                  ▼                                              │   │
│  │                           ┌──────────────┐                                      │   │
│  │                           │  UNINSTALLED │                                      │   │
│  │                           │ (data kept X)│                                      │   │
│  │                           └──────────────┘                                      │   │
│  │                                                                                  │   │
│  └─────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘
\`\`\`

### 7.2 Module Categories and Planned Modules

\`\`\`
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                              MODULE CATALOG v1.0                                         │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  ╔═══════════════════════════════════════════════════════════════════════════════════╗ │
│  ║                              CORE (Always Enabled)                                 ║ │
│  ╠═══════════════════════════════════════════════════════════════════════════════════╣ │
│  ║                                                                                    ║ │
│  ║  core-module                                                                       ║ │
│  ║  ├── Workspace management                                                          ║ │
│  ║  ├── User & team management                                                        ║ │
│  ║  ├── MEI profile (CNPJ, razão social, endereço)                                    ║ │
│  ║  ├── Settings & preferences                                                        ║ │
│  ║  ├── Dashboard home                                                                ║ │
│  ║  ├── Notifications                                                                 ║ │
│  ║  └── Audit logs viewer                                                             ║ │
│  ║                                                                                    ║ │
│  ╚═══════════════════════════════════════════════════════════════════════════════════╝ │
│                                                                                          │
│  ╔═══════════════════════════════════════════════════════════════════════════════════╗ │
│  ║                              SALES CATEGORY                                        ║ │
│  ╠═══════════════════════════════════════════════════════════════════════════════════╣ │
│  ║                                                                                    ║ │
│  ║  ┌─────────────────────────────────────────────────────────────────────────────┐  ║ │
│  ║  │  customers-module (FREE)                                                     │  ║ │
│  ║  │  ├── Customer CRUD                                                           │  ║ │
│  ║  │  ├── PF/PJ support                                                           │  ║ │
│  ║  │  ├── Contact management                                                      │  ║ │
│  ║  │  ├── Address book                                                            │  ║ │
│  ║  │  └── Customer notes                                                          │  ║ │
│  ║  └─────────────────────────────────────────────────────────────────────────────┘  ║ │
│  ║                                                                                    ║ │
│  ║  ┌─────────────────────────────────────────────────────────────────────────────┐  ║ │
│  ║  │  products-module (FREE)                                                      │  ║ │
│  ║  │  ├── Product/Service catalog                                                 │  ║ │
│  ║  │  ├── Pricing management                                                      │  ║ │
│  ║  │  ├── Categories                                                              │  ║ │
│  ║  │  ├── SKU management                                                          │  ║ │
│  ║  │  └── NCM codes                                                               │  ║ │
│  ║  └─────────────────────────────────────────────────────────────────────────────┘  ║ │
│  ║                                                                                    ║ │
│  ║  ┌─────────────────────────────────────────────────────────────────────────────┐  ║ │
│  ║  │  invoicing-module (FREE)                                                     │  ║ │
│  ║  │  ├── Invoice creation                                                        │  ║ │
│  ║  │  ├── Quote generation                                                        │  ║ │
│  ║  │  ├── PDF generation                                                          │  ║ │
│  ║  │  ├── Email sending                                                           │  ║ │
│  ║  │  └── Payment tracking                                                        │  ║ │
│  ║  └─────────────────────────────────────────────────────────────────────────────┘  ║ │
│  ║                                                                                    ║ │
│  ╚═══════════════════════════════════════════════════════════════════════════════════╝ │
│                                                                                          │
│  ╔═══════════════════════════════════════════════════════════════════════════════════╗ │
│  ║                              FINANCE CATEGORY                                      ║ │
│  ╠═══════════════════════════════════════════════════════════════════════════════════╣ │
│  ║                                                                                    ║ │
│  ║  ┌─────────────────────────────────────────────────────────────────────────────┐  ║ │
│  ║  │  finance-module (FREE)                                                       │  ║ │
│  ║  │  ├── Income/Expense tracking                                                 │  ║ │
│  ║  │  ├── Bank accounts                                                           │  ║ │
│  ║  │  ├── Categories                                                              │  ║ │
│  ║  │  ├── Cash flow view                                                          │  ║ │
│  ║  │  └── Basic reports                                                           │  ║ │
│  ║  └─────────────────────────────────────────────────────────────────────────────┘  ║ │
│  ║                                                                                    ║ │
│  ║  ┌─────────────────────────────────────────────────────────────────────────────┐  ║ │
│  ║  │  reconciliation-module (PRO)                                                 │  ║ │
│  ║  │  ├── Bank statement import                                                   │  ║ │
│  ║  │  ├── Auto-matching                                                           │  ║ │
│  ║  │  ├── OFX/CSV support                                                         │  ║ │
│  ║  │  └── Reconciliation reports                                                  │  ║ │
│  ║  └─────────────────────────────────────────────────────────────────────────────┘  ║ │
│  ║                                                                                    ║ │
│  ║  ┌─────────────────────────────────────────────────────────────────────────────┐  ║ │
│  ║  │  reports-module (PRO)                                                        │  ║ │
│  ║  │  ├── Advanced financial reports                                              │  ║ │
│  ║  │  ├── DRE (Income Statement)                                                  │  ║ │
│  ║  │  ├── Cash flow projections                                                   │  ║ │
│  ║  │  └── Export to Excel/PDF                                                     │  ║ │
│  ║  └─────────────────────────────────────────────────────────────────────────────┘  ║ │
│  ║                                                                                    ║ │
│  ╚═══════════════════════════════════════════════════════════════════════════════════╝ │
│                                                                                          │
│  ╔═══════════════════════════════════════════════════════════════════════════════════╗ │
│  ║                              FISCAL CATEGORY                                       ║ │
│  ╠═══════════════════════════════════════════════════════════════════════════════════╣ │
│  ║                                                                                    ║ │
│  ║  ┌─────────────────────────────────────────────────────────────────────────────┐  ║ │
│  ║  │  nfe-module (STARTER)                                                        │  ║ │
│  ║  │  ├── NF-e emission                                                           │  ║ │
│  ║  │  ├── NF-e cancellation                                                       │  ║ │
│  ║  │  ├── SEFAZ integration                                                       │  ║ │
│  ║  │  ├── Certificate A1 management                                               │  ║ │
│  ║  │  └── XML storage                                                             │  ║ │
│  ║  └─────────────────────────────────────────────────────────────────────────────┘  ║ │
│  ║                                                                                    ║ │
│  ║  ┌─────────────────────────────────────────────────────────────────────────────┐  ║ │
│  ║  │  nfse-module (STARTER)                                                       │  ║ │
│  ║  │  ├── NFS-e emission                                                          │  ║ │
│  ║  │  ├── Municipal integrations                                                  │  ║ │
│  ║  │  └── RPS management                                                          │  ║ │
│  ║  └─────────────────────────────────────────────────────────────────────────────┘  ║ │
│  ║                                                                                    ║ │
│  ║  ┌─────────────────────────────────────────────────────────────────────────────┐  ║ │
│  ║  │  das-module (FREE)                                                           │  ║ │
│  ║  │  ├── DAS MEI calculation                                                     │  ║ │
│  ║  │  ├── Payment reminders                                                       │  ║ │
│  ║  │  └── Annual declaration helper                                               │  ║ │
│  ║  └─────────────────────────────────────────────────────────────────────────────┘  ║ │
│  ║                                                                                    ║ │
│  ╚═══════════════════════════════════════════════════════════════════════════════════╝ │
│                                                                                          │
│  ╔═══════════════════════════════════════════════════════════════════════════════════╗ │
│  ║                              PAYMENTS CATEGORY                                     ║ │
│  ╠═══════════════════════════════════════════════════════════════════════════════════╣ │
│  ║                                                                                    ║ │
│  ║  ┌─────────────────────────────────────────────────────────────────────────────┐  ║ │
│  ║  │  pix-module (STARTER)                                                        │  ║ │
│  ║  │  ├── PIX QR Code generation                                                  │  ║ │
│  ║  │  ├── Copy & paste codes                                                      │  ║ │
│  ║  │  ├── Payment webhooks                                                        │  ║ │
│  ║  │  ├── Auto-reconciliation                                                     │  ║ │
│  ║  │  └── PSP integrations                                                        │  ║ │
│  ║  └─────────────────────────────────────────────────────────────────────────────┘  ║ │
│  ║                                                                                    ║ │
│  ║  ┌─────────────────────────────────────────────────────────────────────────────┐  ║ │
│  ║  │  boleto-module (PRO)                                                         │  ║ │
│  ║  │  ├── Registered boleto generation                                            │  ║ │
│  ║  │  ├── Bank integrations                                                       │  ║ │
│  ║  │  └── Payment tracking                                                        │  ║ │
│  ║  └─────────────────────────────────────────────────────────────────────────────┘  ║ │
│  ║                                                                                    ║ │
│  ╚═══════════════════════════════════════════════════════════════════════════════════╝ │
│                                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘
\`\`\`

---

## 8. API Architecture

### 8.1 Universal API Design

\`\`\`
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                              API ARCHITECTURE                                            │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  API LAYERS                                                                             │
│  ══════════                                                                             │
│                                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐   │
│  │                                                                                  │   │
│  │  LAYER 1: SERVER ACTIONS (Internal - React Server Components)                   │   │
│  │  ────────────────────────────────────────────────────────────────────────────── │   │
│  │  Purpose: Direct server mutations from React components                         │   │
│  │  Auth: Clerk session (automatic)                                                │   │
│  │  Tenant: From session context                                                   │   │
│  │                                                                                  │   │
│  │  Examples:                                                                      │   │
│  │  - createCustomer(formData)                                                     │   │
│  │  - updateInvoice(id, data)                                                      │   │
│  │  - deleteProduct(id)                                                            │   │
│  │                                                                                  │   │
│  └─────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐   │
│  │                                                                                  │   │
│  │  LAYER 2: REST API (External - Partner Apps, Integrations)                      │   │
│  │  ────────────────────────────────────────────────────────────────────────────── │   │
│  │  Purpose: External integrations, mobile apps, third-party access               │   │
│  │  Auth: API Key + Bearer Token                                                   │   │
│  │  Tenant: From X-Tenant-ID header or API key scope                               │   │
│  │                                                                                  │   │
│  │  Base URL: /api/v1                                                              │   │
│  │                                                                                  │   │
│  │  Versioning: URL-based (/api/v1, /api/v2)                                       │   │
│  │  Format: JSON                                                                   │   │
│  │  Pagination: Cursor-based                                                       │   │
│  │                                                                                  │   │
│  └─────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐   │
│  │                                                                                  │   │
│  │  LAYER 3: WEBHOOKS (Inbound & Outbound)                                         │   │
│  │  ────────────────────────────────────────────────────────────────────────────── │   │
│  │                                                                                  │   │
│  │  INBOUND (receive from external services):                                      │   │
│  │  - /api/webhooks/clerk          → User events                                   │   │
│  │  - /api/webhooks/stripe         → Payment events                                │   │
│  │  - /api/webhooks/inngest        → Job events                                    │   │
│  │  - /api/webhooks/[tenant]/pix   → PIX notifications                             │   │
│  │  - /api/webhooks/[tenant]/sefaz → NF-e status                                   │   │
│  │                                                                                  │   │
│  │  OUTBOUND (send to integrations):                                               │   │
│  │  - Configurable per tenant                                                      │   │
│  │  - Events: invoice.created, payment.received, etc.                              │   │
│  │  - Retry with exponential backoff                                               │   │
│  │  - Signature verification (HMAC)                                                │   │
│  │                                                                                  │   │
│  └─────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐   │
│  │                                                                                  │   │
│  │  LAYER 4: RPC (Internal - Complex Operations)                                   │   │
│  │  ────────────────────────────────────────────────────────────────────────────── │   │
│  │  Purpose: Complex multi-step operations, batch processing                       │   │
│  │  Implementation: Custom RPC-style endpoints                                     │   │
│  │                                                                                  │   │
│  │  Examples:                                                                      │   │
│  │  - POST /api/v1/rpc/bulk-import-customers                                       │   │
│  │  - POST /api/v1/rpc/generate-monthly-report                                     │   │
│  │  - POST /api/v1/rpc/migrate-from-legacy                                         │   │
│  │                                                                                  │   │
│  └─────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘
\`\`\`

### 8.2 REST API Endpoint Structure

\`\`\`
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                              REST API ENDPOINTS                                          │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  ENDPOINT CONVENTIONS                                                                   │
│  ════════════════════                                                                   │
│                                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐   │
│  │                                                                                  │   │
│  │  URL Structure: /api/v{version}/{resource}[/{id}][/{sub-resource}]              │   │
│  │                                                                                  │   │
│  │  HTTP Methods:                                                                  │   │
│  │  ├── GET     → Read (list or single)                                            │   │
│  │  ├── POST    → Create                                                           │   │
│  │  ├── PATCH   → Partial update                                                   │   │
│  │  ├── PUT     → Full replace (rarely used)                                       │   │
│  │  └── DELETE  → Soft delete                                                      │   │
│  │                                                                                  │   │
│  │  Response Format:                                                               │   │
│  │  {                                                                              │   │
│  │    "data": { ... } | [ ... ],                                                   │   │
│  │    "meta": {                                                                    │   │
│  │      "pagination": { "cursor", "hasMore", "total" },                            │   │
│  │      "requestId": "req_xxx"                                                     │   │
│  │    }                                                                            │   │
│  │  }                                                                              │   │
│  │                                                                                  │   │
│  │  Error Format:                                                                  │   │
│  │  {                                                                              │   │
│  │    "error": {                                                                   │   │
│  │      "code": "VALIDATION_ERROR",                                                │   │
│  │      "message": "Human readable message",                                       │   │
│  │      "details": [ { "field", "message" } ],                                     │   │
│  │      "requestId": "req_xxx"                                                     │   │
│  │    }                                                                            │   │
│  │  }                                                                              │   │
│  │                                                                                  │   │
│  └─────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                          │
│  CORE ENDPOINTS                                                                         │
│  ══════════════                                                                         │
│                                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐   │
│  │                                                                                  │   │
│  │  CUSTOMERS                                                                      │   │
│  │  ──────────────────────────────────────────────────────────────────────────────│   │
│  │  GET    /api/v1/customers              List customers (paginated)              │   │
│  │  POST   /api/v1/customers              Create customer                         │   │
│  │  GET    /api/v1/customers/:id          Get customer by ID                      │   │
│  │  PATCH  /api/v1/customers/:id          Update customer                         │   │
│  │  DELETE /api/v1/customers/:id          Soft delete customer                    │   │
│  │  GET    /api/v1/customers/:id/invoices Customer's invoices                     │   │
│  │                                                                                  │   │
│  │  PRODUCTS                                                                       │   │
│  │  ──────────────────────────────────────────────────────────────────────────────│   │
│  │  GET    /api/v1/products               List products                           │   │
│  │  POST   /api/v1/products               Create product                          │   │
│  │  GET    /api/v1/products/:id           Get product                             │   │
│  │  PATCH  /api/v1/products/:id           Update product                          │   │
│  │  DELETE /api/v1/products/:id           Soft delete product                     │   │
│  │                                                                                  │   │
│  │  INVOICES                                                                       │   │
│  │  ──────────────────────────────────────────────────────────────────────────────│   │
│  │  GET    /api/v1/invoices               List invoices                           │   │
│  │  POST   /api/v1/invoices               Create invoice                          │   │
│  │  GET    /api/v1/invoices/:id           Get invoice with items                  │   │
│  │  PATCH  /api/v1/invoices/:id           Update invoice                          │   │
│  │  POST   /api/v1/invoices/:id/send      Send invoice via email                  │   │
│  │  POST   /api/v1/invoices/:id/pay       Mark as paid                            │   │
│  │  POST   /api/v1/invoices/:id/cancel    Cancel invoice                          │   │
│  │  GET    /api/v1/invoices/:id/pdf       Download PDF                            │   │
│  │                                                                                  │   │
│  │  TRANSACTIONS                                                                   │   │
│  │  ──────────────────────────────────────────────────────────────────────────────│   │
│  │  GET    /api/v1/transactions           List transactions                       │   │
│  │  POST   /api/v1/transactions           Create transaction                      │   │
│  │  GET    /api/v1/transactions/:id       Get transaction                         │   │
│  │  PATCH  /api/v1/transactions/:id       Update transaction                      │   │
│  │  DELETE /api/v1/transactions/:id       Delete transaction                      │   │
│  │  GET    /api/v1/transactions/summary   Period summary                          │   │
│  │                                                                                  │   │
│  └─────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                          │
│  MODULE-SPECIFIC ENDPOINTS                                                              │
│  ═════════════════════════                                                              │
│                                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐   │
│  │                                                                                  │   │
│  │  NFE MODULE                                                                     │   │
│  │  ──────────────────────────────────────────────────────────────────────────────│   │
│  │  POST   /api/v1/nfe                    Emit NF-e                               │   │
│  │  GET    /api/v1/nfe/:id                Get NF-e status                         │   │
│  │  POST   /api/v1/nfe/:id/cancel         Cancel NF-e                             │   │
│  │  GET    /api/v1/nfe/:id/xml            Download XML                            │   │
│  │  GET    /api/v1/nfe/:id/danfe          Download DANFE PDF                      │   │
│  │                                                                                  │   │
│  │  PIX MODULE                                                                     │   │
│  │  ──────────────────────────────────────────────────────────────────────────────│   │
│  │  POST   /api/v1/pix/charge             Create PIX charge                       │   │
│  │  GET    /api/v1/pix/charge/:id         Get charge status                       │   │
│  │  POST   /api/v1/pix/charge/:id/refund  Refund PIX                              │   │
│  │  GET    /api/v1/pix/keys               List PIX keys                           │   │
│  │  POST   /api/v1/pix/keys               Register PIX key                        │   │
│  │                                                                                  │   │
│  └─────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘
\`\`\`

### 8.3 API Contract Example

\`\`\`
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                              API CONTRACT: CREATE INVOICE                                │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  REQUEST                                                                                │
│  ═══════                                                                                │
│                                                                                          │
│  POST /api/v1/invoices                                                                  │
│                                                                                          │
│  Headers:                                                                               │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐   │
│  │  Authorization: Bearer <api_key>                                                │   │
│  │  X-Tenant-ID: tenant_acme                                                       │   │
│  │  Content-Type: application/json                                                 │   │
│  │  X-Idempotency-Key: <uuid>                                                      │   │
│  │  X-Request-ID: <uuid>                                                           │   │
│  └─────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                          │
│  Body Schema (Zod):                                                                     │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐   │
│  │                                                                                  │   │
│  │  CreateInvoiceRequest = {                                                       │   │
│  │    customer_id: string (uuid)                                                   │   │
│  │    due_date: string (ISO date)                                                  │   │
│  │    items: [{                                                                    │   │
│  │      product_id?: string (uuid)                                                 │   │
│  │      description: string (1-500 chars)                                          │   │
│  │      quantity: number (> 0)                                                     │   │
│  │      unit_price: number (>= 0, 2 decimals)                                      │   │
│  │      discount?: number (>= 0)                                                   │   │
│  │    }] (min 1 item)                                                              │   │
│  │    discount?: number (>= 0)                                                     │   │
│  │    notes?: string (max 1000 chars)                                              │   │
│  │    payment_method?: 'pix' | 'boleto' | 'transfer' | 'cash' | 'other'            │   │
│  │    options?: {                                                                  │   │
│  │      generate_pix?: boolean                                                     │   │
│  │      send_email?: boolean                                                       │   │
│  │      send_whatsapp?: boolean                                                    │   │
│  │    }                                                                            │   │
│  │  }                                                                              │   │
│  │                                                                                  │   │
│  └─────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                          │
│  RESPONSE (201 Created)                                                                 │
│  ══════════════════════                                                                 │
│                                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐   │
│  │                                                                                  │   │
│  │  {                                                                              │   │
│  │    "data": {                                                                    │   │
│  │      "id": "inv_01HXYZ...",                                                     │   │
│  │      "number": "2024/0042",                                                     │   │
│  │      "status": "pending",                                                       │   │
│  │      "customer": {                                                              │   │
│  │        "id": "cust_01HXYZ...",                                                  │   │
│  │        "name": "João Silva",                                                    │   │
│  │        "email": "joao@email.com"                                                │   │
│  │      },                                                                         │   │
│  │      "items": [                                                                 │   │
│  │        {                                                                        │   │
│  │          "id": "item_01HXYZ...",                                                │   │
│  │          "description": "Consultoria",                                          │   │
│  │          "quantity": 10,                                                        │   │
│  │          "unit_price": 150.00,                                                  │   │
│  │          "discount": 0,                                                         │   │
│  │          "total": 1500.00                                                       │   │
│  │        }                                                                        │   │
│  │      ],                                                                         │   │
│  │      "subtotal": 1500.00,                                                       │   │
│  │      "discount": 100.00,                                                        │   │
│  │      "total": 1400.00,                                                          │   │
│  │      "issue_date": "2024-01-15T10:30:00Z",                                      │   │
│  │      "due_date": "2024-02-15T23:59:59Z",                                        │   │
│  │      "payment_method": "pix",                                                   │   │
│  │      "pix": {                                                                   │   │
│  │        "qr_code_base64": "...",                                                 │   │
│  │        "copy_paste": "00020126...",                                             │   │
│  │        "expires_at": "2024-02-15T23:59:59Z"                                     │   │
│  │      },                                                                         │   │
│  │      "public_url": "https://pay.seumei.com.br/inv_01HXYZ...",                   │   │
│  │      "pdf_url": "https://cdn.seumei.com.br/invoices/inv_01HXYZ.pdf",            │   │
│  │      "created_at": "2024-01-15T10:30:00Z",                                      │   │
│  │      "updated_at": "2024-01-15T10:30:00Z"                                       │   │
│  │    },                                                                           │   │
│  │    "meta": {                                                                    │   │
│  │      "requestId": "req_01HXYZ...",                                              │   │
│  │      "actions": {                                                               │   │
│  │        "email_sent": true,                                                      │   │
│  │        "email_sent_to": "joao@email.com"                                        │   │
│  │      }                                                                          │   │
│  │    }                                                                            │   │
│  │  }                                                                              │   │
│  │                                                                                  │   │
│  └─────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                          │
│  ERROR RESPONSES                                                                        │
│  ═══════════════                                                                        │
│                                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐   │
│  │                                                                                  │   │
│  │  400 Bad Request (Validation Error)                                             │   │
│  │  {                                                                              │   │
│  │    "error": {                                                                   │   │
│  │      "code": "VALIDATION_ERROR",                                                │   │
│  │      "message": "Request validation failed",                                    │   │
│  │      "details": [                                                               │   │
│  │        { "field": "items[0].quantity", "message": "Must be greater than 0" }   │   │
│  │      ],                                                                         │   │
│  │      "requestId": "req_01HXYZ..."                                               │   │
│  │    }                                                                            │   │
│  │  }                                                                              │   │
│  │                                                                                  │   │
│  │  401 Unauthorized                                                               │   │
│  │  { "error": { "code": "UNAUTHORIZED", "message": "Invalid API key" } }          │   │
│  │                                                                                  │   │
│  │  403 Forbidden                                                                  │   │
│  │  { "error": { "code": "FORBIDDEN", "message": "Insufficient permissions" } }    │   │
│  │                                                                                  │   │
│  │  404 Not Found                                                                  │   │
│  │  { "error": { "code": "NOT_FOUND", "message": "Customer not found" } }          │   │
│  │                                                                                  │   │
│  │  429 Too Many Requests                                                          │   │
│  │  { "error": { "code": "RATE_LIMITED", "message": "Rate limit exceeded" } }      │   │
│  │                                                                                  │   │
│  └─────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘
\`\`\`

---

## 9. Data Architecture

### 9.1 Entity Relationship Diagram

\`\`\`
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                              ENTITY RELATIONSHIP DIAGRAM                                 │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  SYSTEM SCHEMA (_system)                                                                │
│  ═══════════════════════                                                                │
│                                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐   │
│  │                                                                                  │   │
│  │  ┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐    │   │
│  │  │     plans       │         │     tenants     │         │  global_users   │    │   │
│  │  ├─────────────────┤         ├─────────────────┤         ├─────────────────┤    │   │
│  │  │ id          PK  │◄────────│ plan_id     FK  │         │ id          PK  │    │   │
│  │  │ slug            │         │ id          PK  │◄───┐    │ clerk_id    UK  │    │   │
│  │  │ name            │         │ slug        UK  │    │    │ email       UK  │    │   │
│  │  │ price_monthly   │         │ name            │    │    │ name            │    │   │
│  │  │ price_yearly    │         │ schema_name UK  │    │    │ avatar_url      │    │   │
│  │  │ features JSONB  │         │ owner_id    FK  │────┼───▶│ created_at      │    │   │
│  │  │ limits   JSONB  │         │ settings JSONB  │    │    │ updated_at      │    │   │
│  │  │ is_active       │         │ billing_email   │    │    └─────────────────┘    │   │
│  │  │ created_at      │         │ stripe_customer │    │                           │   │
│  │  └─────────────────┘         │ stripe_subscr   │    │    ┌─────────────────┐    │   │
│  │                              │ status          │    │    │  tenant_users   │    │   │
│  │                              │ trial_ends_at   │    │    ├─────────────────┤    │   │
│  │                              │ created_at      │    └────│ tenant_id   FK  │    │   │
│  │                              │ deleted_at      │         │ user_id     FK  │────┘   │
│  │                              └─────────────────┘         │ role            │    │   │
│  │                                      │                   │ permissions[]   │    │   │
│  │                                      │                   │ invited_at      │    │   │
│  │                                      │                   │ joined_at       │    │   │
│  │                                      │                   └─────────────────┘    │   │
│  │                                      │                                          │   │
│  │                              ┌───────▼───────┐                                  │   │
│  │                              │ tenant_modules│                                  │   │
│  │                              ├───────────────┤                                  │   │
│  │                              │ tenant_id  FK │                                  │   │
│  │                              │ module_slug   │                                  │   │
│  │                              │ status        │                                  │   │
│  │                              │ config JSONB  │                                  │   │
│  │                              │ installed_at  │                                  │   │
│  │                              │ enabled_at    │                                  │   │
│  │                              └───────────────┘                                  │   │
│  │                                                                                  │   │
│  └─────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                          │
│  TENANT SCHEMA (tenant_{slug})                                                          │
│  ═════════════════════════════                                                          │
│                                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐   │
│  │                                                                                  │   │
│  │  ┌─────────────────┐                              ┌─────────────────┐           │   │
│  │  │   mei_profile   │                              │    customers    │           │   │
│  │  ├─────────────────┤                              ├─────────────────┤           │   │
│  │  │ id          PK  │                              │ id          PK  │           │   │
│  │  │ cnpj        UK  │                              │ type (PF/PJ)    │           │   │
│  │  │ razao_social    │                              │ name            │           │   │
│  │  │ nome_fantasia   │                              │ email           │           │   │
│  │  │ cnae_principal  │                              │ phone           │           │   │
│  │  │ endereco JSONB  │                              │ document    UK  │           │   │
│  │  │ certificado_a1  │                              │ address JSONB   │           │   │
│  │  │ simples_nacional│                              │ notes           │           │   │
│  │  │ data_abertura   │                              │ tags[]          │           │   │
│  │  │ created_at      │                              │ owner_user_id   │           │   │
│  │  │ updated_at      │                              │ created_at      │           │   │
│  │  └─────────────────┘                              │ updated_at      │           │   │
│  │                                                   │ deleted_at      │           │   │
│  │  ┌─────────────────┐                              └────────┬────────┘           │   │
│  │  │    products     │                                       │                    │   │
│  │  ├─────────────────┤                                       │                    │   │
│  │  │ id          PK  │                                       │                    │   │
│  │  │ name            │                                       │                    │   │
│  │  │ description     │                                       │                    │   │
│  │  │ sku         UK  │                                       │                    │   │
│  │  │ price           │                                       │                    │   │
│  │  │ cost            │                                       │                    │   │
│  │  │ is_service      │                                       │                    │   │
│  │  │ ncm_code        │                                       │                    │   │
│  │  │ category_id FK  │                                       │                    │   │
│  │  │ created_at      │                                       │                    │   │
│  │  │ deleted_at      │                                       │                    │   │
│  │  └────────┬────────┘                                       │                    │   │
│  │           │                                                │                    │   │
│  │           │                    ┌───────────────────────────┘                    │   │
│  │           │                    │                                                │   │
│  │           │           ┌────────▼────────┐         ┌─────────────────┐           │   │
│  │           │           │    invoices     │         │  invoice_items  │           │   │
│  │           │           ├─────────────────┤         ├─────────────────┤           │   │
│  │           │           │ id          PK  │◄────────│ invoice_id  FK  │           │   │
│  │           │           │ number      UK  │         │ id          PK  │           │   │
│  │           │           │ customer_id FK  │         │ product_id  FK  │───────────┘   │
│  │           │           │ status          │         │ description     │           │   │
│  │           │           │ issue_date      │         │ quantity        │           │   │
│  │           │           │ due_date        │         │ unit_price      │           │   │
│  │           │           │ subtotal        │         │ discount        │           │   │
│  │           │           │ discount        │         │ total           │           │   │
│  │           │           │ total           │         └─────────────────┘           │   │
│  │           │           │ notes           │                                       │   │
│  │           │           │ payment_method  │                                       │   │
│  │           │           │ paid_at         │                                       │   │
│  │           │           │ nfe_id          │                                       │   │
│  │           │           │ pdf_url         │                                       │   │
│  │           │           │ created_at      │                                       │   │
│  │           │           │ deleted_at      │                                       │   │
│  │           │           └─────────────────┘                                       │   │
│  │           │                                                                      │   │
│  │           │           ┌─────────────────┐         ┌─────────────────┐           │   │
│  │           │           │  transactions   │         │  bank_accounts  │           │   │
│  │           │           ├─────────────────┤         ├─────────────────┤           │   │
│  │           │           │ id          PK  │         │ id          PK  │           │   │
│  │           └──────────▶│ type (in/out)   │         │ name            │           │   │
│  │                       │ category_id FK  │         │ bank_code       │           │   │
│  │                       │ account_id  FK  │◄────────│ agency          │           │   │
│  │                       │ invoice_id  FK  │         │ account_number  │           │   │
│  │                       │ amount          │         │ initial_balance │           │   │
│  │                       │ description     │         │ current_balance │           │   │
│  │                       │ date            │         │ is_default      │           │   │
│  │                       │ is_recurring    │         │ color           │           │   │
│  │                       │ recurrence_rule │         │ created_at      │           │   │
│  │                       │ created_at      │         └─────────────────┘           │   │
│  │                       │ deleted_at      │                                       │   │
│  │                       └─────────────────┘                                       │   │
│  │                                                                                  │   │
│  │           ┌─────────────────┐         ┌─────────────────┐                       │   │
│  │           │   audit_logs    │         │  module_config  │                       │   │
│  │           ├─────────────────┤         ├─────────────────┤                       │   │
│  │           │ id          PK  │         │ id          PK  │                       │   │
│  │           │ user_id         │         │ module_slug     │                       │   │
│  │           │ action          │         │ config JSONB    │                       │   │
│  │           │ entity_type     │         │ updated_at      │                       │   │
│  │           │ entity_id       │         └─────────────────┘                       │   │
│  │           │ old_data JSONB  │                                                   │   │
│  │           │ new_data JSONB  │                                                   │   │
│  │           │ metadata JSONB  │                                                   │   │
│  │           │ created_at      │                                                   │   │
│  │           └─────────────────┘                                                   │   │
│  │                                                                                  │   │
│  └─────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘
\`\`\`

---

## 10. Authentication & Authorization

### 10.1 Auth Architecture

\`\`\`
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                              AUTHENTICATION & AUTHORIZATION                              │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  AUTHENTICATION FLOW                                                                    │
│  ═══════════════════                                                                    │
│                                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐   │
│  │                                                                                  │   │
│  │  ┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐   │   │
│  │  │  User   │────▶│  Clerk  │────▶│ Session │────▶│Middleware│────▶│  App    │   │   │
│  │  │ Browser │     │  Auth   │     │  Token  │     │  Verify │     │ Context │   │   │
│  │  └─────────┘     └─────────┘     └─────────┘     └─────────┘     └─────────┘   │   │
│  │                                                                                  │   │
│  │  1. User signs in via Clerk (email, OAuth, etc.)                                │   │
│  │  2. Clerk issues session token (JWT)                                            │   │
│  │  3. Token sent with each request (cookie or header)                             │   │
│  │  4. Middleware validates token with Clerk                                       │   │
│  │  5. User context available in app                                               │   │
│  │                                                                                  │   │
│  └─────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                          │
│  AUTHORIZATION MODEL                                                                    │
│  ═══════════════════                                                                    │
│                                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐   │
│  │                                                                                  │   │
│  │  ROLE HIERARCHY                                                                 │   │
│  │                                                                                  │   │
│  │                           ┌─────────────┐                                       │   │
│  │                           │    OWNER    │                                       │   │
│  │                           │  (1 per ws) │                                       │   │
│  │                           └──────┬──────┘                                       │   │
│  │                                  │ inherits all                                 │   │
│  │                           ┌──────▼──────┐                                       │   │
│  │                           │    ADMIN    │                                       │   │
│  │                           │ (full mgmt) │                                       │   │
│  │                           └──────┬──────┘                                       │   │
│  │                                  │ inherits                                     │   │
│  │               ┌──────────────────┼──────────────────┐                          │   │
│  │               │                  │                  │                          │   │
│  │        ┌──────▼──────┐    ┌──────▼──────┐    ┌──────▼──────┐                   │   │
│  │        │   MANAGER   │    │  OPERATOR   │    │   VIEWER    │                   │   │
│  │        │(dept access)│    │(day-to-day) │    │ (read-only) │                   │   │
│  │        └─────────────┘    └─────────────┘    └─────────────┘                   │   │
│  │                                                                                  │   │
│  │  PERMISSION MATRIX                                                              │   │
│  │  ─────────────────────────────────────────────────────────────────────────────  │   │
│  │  Resource              │ Owner │ Admin │ Manager │ Operator │ Viewer │         │   │
│  │  ──────────────────────┼───────┼───────┼─────────┼──────────┼────────┤         │   │
│  │  workspace.delete      │   ✓   │       │         │          │        │         │   │
│  │  workspace.billing     │   ✓   │   ✓   │         │          │        │         │   │
│  │  workspace.settings    │   ✓   │   ✓   │         │          │        │         │   │
│  │  team.manage           │   ✓   │   ✓   │         │          │        │         │   │
│  │  modules.manage        │   ✓   │   ✓   │         │          │        │         │   │
│  │  ──────────────────────┼───────┼───────┼─────────┼──────────┼────────┤         │   │
│  │  customers.create      │   ✓   │   ✓   │    ✓    │    ✓     │        │         │   │
│  │  customers.read        │   ✓   │   ✓   │    ✓    │    ✓     │   ✓    │         │   │
│  │  customers.update      │   ✓   │   ✓   │    ✓    │    ✓     │        │         │   │
│  │  customers.delete      │   ✓   │   ✓   │    ✓    │          │        │         │   │
│  │  ──────────────────────┼───────┼───────┼─────────┼──────────┼────────┤         │   │
│  │  invoices.create       │   ✓   │   ✓   │    ✓    │    ✓     │        │         │   │
│  │  invoices.read         │   ✓   │   ✓   │    ✓    │    ✓     │   ✓    │         │   │
│  │  invoices.cancel       │   ✓   │   ✓   │    ✓    │          │        │         │   │
│  │  ──────────────────────┼───────┼───────┼─────────┼──────────┼────────┤         │   │
│  │  finance.read          │   ✓   │   ✓   │    ✓    │    ✓     │   ✓    │         │   │
│  │  finance.manage        │   ✓   │   ✓   │    ✓    │          │        │         │   │
│  │  finance.reports       │   ✓   │   ✓   │    ✓    │          │        │         │   │
│  │                                                                                  │   │
│  └─────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘
\`\`\`

---

## 11. Async Workflows & Background Jobs

### 11.1 Inngest Architecture

\`\`\`
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                              ASYNC WORKFLOW ARCHITECTURE                                 │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  WHY INNGEST                                                                            │
│  ═══════════                                                                            │
│                                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐   │
│  │                                                                                  │   │
│  │  Comparison: Inngest vs Trigger.dev vs BullMQ                                   │   │
│  │                                                                                  │   │
│  │  ┌───────────────────────────────────────────────────────────────────────────┐  │   │
│  │  │ Criterion          │ Inngest    │ Trigger.dev │ BullMQ      │            │  │   │
│  │  ├────────────────────┼────────────┼─────────────┼─────────────┤            │  │   │
│  │  │ Serverless-native  │   ★★★★★    │   ★★★★★     │    ★★       │            │  │   │
│  │  │ Step functions     │   ★★★★★    │   ★★★★      │    ★★       │            │  │   │
│  │  │ Retry/backoff      │   ★★★★★    │   ★★★★      │   ★★★★      │            │  │   │
│  │  │ Observability      │   ★★★★★    │   ★★★★      │   ★★★       │            │  │   │
│  │  │ Cron scheduling    │   ★★★★★    │   ★★★★      │   ★★★★      │            │  │   │
│  │  │ No infra needed    │   ★★★★★    │   ★★★★★     │    ★        │            │  │   │
│  │  │ Vercel integration │   ★★★★★    │   ★★★★      │   ★★        │            │  │   │
│  │  │ Cost at scale      │   ★★★★     │   ★★★★      │   ★★★★★     │            │  │   │
│  │  └───────────────────────────────────────────────────────────────────────────┘  │   │
│  │                                                                                  │   │
│  │  DECISION: Inngest for primary workflows                                        │   │
│  │  - Zero infrastructure management                                               │   │
│  │  - Native step functions for complex workflows                                  │   │
│  │  - Excellent Vercel integration                                                 │   │
│  │  - Built-in observability                                                       │   │
│  │                                                                                  │   │
│  │  ALTERNATIVE: Trigger.dev for specific use cases                                │   │
│  │  - If Inngest pricing becomes prohibitive                                       │   │
│  │  - For very long-running jobs (>15 min)                                         │   │
│  │                                                                                  │   │
│  └─────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                          │
│  JOB CATEGORIES                                                                         │
│  ══════════════                                                                         │
│                                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐   │
│  │                                                                                  │   │
│  │  TENANT PROVISIONING                                                            │   │
│  │  ├── tenant/provision           Create schema, run migrations, seed data       │   │
│  │  ├── tenant/deprovision         Cleanup, archive, delete schema                 │   │
│  │  └── tenant/migrate             Run pending migrations for tenant               │   │
│  │                                                                                  │   │
│  │  BILLING                                                                        │   │
│  │  ├── billing/subscription.created    Setup workspace limits                     │   │
│  │  ├── billing/subscription.updated    Update plan limits                         │   │
│  │  ├── billing/subscription.cancelled  Downgrade to free                          │   │
│  │  ├── billing/invoice.paid            Activate subscription                      │   │
│  │  └── billing/trial.expiring          Send reminder (cron: daily)                │   │
│  │                                                                                  │   │
│  │  NOTIFICATIONS                                                                  │   │
│  │  ├── notify/email.send               Send transactional email                   │   │
│  │  ├── notify/sms.send                 Send SMS notification                      │   │
│  │  ├── notify/whatsapp.send            Send WhatsApp message                      │   │
│  │  └── notify/digest.daily             Daily summary (cron: 8am)                  │   │
│  │                                                                                  │   │
│  │  INVOICING                                                                      │   │
│  │  ├── invoice/created                 Generate PDF, send email                   │   │
│  │  ├── invoice/overdue.check           Check overdue (cron: daily)                │   │
│  │  ├── invoice/reminder.send           Send payment reminder                      │   │
│  │  └── invoice/recurring.generate      Generate recurring (cron: daily)           │   │
│  │                                                                                  │   │
│  │  FISCAL (Module-specific)                                                       │   │
│  │  ├── nfe/emit                        Emit NF-e to SEFAZ                         │   │
│  │  ├── nfe/cancel                      Cancel NF-e                                │   │
│  │  ├── nfe/status.check                Check pending (cron: 5min)                 │   │
│  │  └── nfe/xml.download                Download authorized XML                    │   │
│  │                                                                                  │   │
│  │  PAYMENTS (Module-specific)                                                     │   │
│  │  ├── pix/payment.received            Process PIX payment                        │   │
│  │  ├── pix/qrcode.expired              Handle expired QR codes                    │   │
│  │  └── pix/reconciliation              Reconcile payments (cron: 1h)              │   │
│  │                                                                                  │   │
│  │  WEBHOOKS                                                                       │   │
│  │  ├── webhook/outbound.send           Send webhook to integrations               │   │
│  │  └── webhook/retry.failed            Retry failed webhooks                      │   │
│  │                                                                                  │   │
│  │  SYSTEM                                                                         │   │
│  │  ├── system/audit.cleanup            Cleanup old audit logs (weekly)            │   │
│  │  ├── system/metrics.aggregate        Aggregate metrics (hourly)                 │   │
│  │  └── system/backup.trigger           Trigger DB backup (daily)                  │   │
│  │                                                                                  │   │
│  └─────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                          │
│  WORKFLOW EXAMPLE: Invoice Created                                                      │
│  ══════════════════════════════════                                                     │
│                                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐   │
│  │                                                                                  │   │
│  │  Event: invoice.created                                                         │   │
│  │                                                                                  │   │
│  │  ┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐                   │   │
│  │  │ Step 1  │────▶│ Step 2  │────▶│ Step 3  │────▶│ Step 4  │                   │   │
│  │  │Generate │     │ Upload  │     │  Send   │     │ Update  │                   │   │
│  │  │  PDF    │     │ to Blob │     │  Email  │     │ Status  │                   │   │
│  │  └─────────┘     └─────────┘     └─────────┘     └─────────┘                   │   │
│  │       │                               │                                         │   │
│  │       │ (parallel if PIX enabled)     │ (parallel if WhatsApp enabled)         │   │
│  │       ▼                               ▼                                         │   │
│  │  ┌─────────┐                    ┌─────────────┐                                │   │
│  │  │Generate │                    │ Send WA msg │                                │   │
│  │  │PIX QR   │                    │             │                                │   │
│  │  └─────────┘                    └─────────────┘                                │   │
│  │                                                                                  │   │
│  │  Features:                                                                      │   │
│  │  - Each step is independently retryable                                         │   │
│  │  - Automatic exponential backoff                                                │   │
│  │  - Step results cached for replay                                               │   │
│  │  - Full observability in Inngest dashboard                                      │   │
│  │                                                                                  │   │
│  └─────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘
\`\`\`

---

## 12. Real-Time Architecture

### 12.1 Redis-Based Real-Time

\`\`\`
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                              REAL-TIME ARCHITECTURE                                      │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  UPSTASH REDIS FOR REAL-TIME                                                            │
│  ═══════════════════════════                                                            │
│                                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐   │
│  │                                                                                  │   │
│  │  USE CASES                                                                      │   │
│  │                                                                                  │   │
│  │  1. CACHING                                                                     │   │
│  │     ├── Tenant configuration cache                                              │   │
│  │     ├── User session data                                                       │   │
│  │     ├── API response cache                                                      │   │
│  │     └── Feature flag cache                                                      │   │
│  │                                                                                  │   │
│  │  2. RATE LIMITING                                                               │   │
│  │     ├── API rate limits per tenant                                              │   │
│  │     ├── Login attempt limits                                                    │   │
│  │     └── Webhook delivery limits                                                 │   │
│  │                                                                                  │   │
│  │  3. PUB/SUB (Real-time updates)                                                 │   │
│  │     ├── Dashboard live updates                                                  │   │
│  │     ├── Notification delivery                                                   │   │
│  │     └── Multi-tab synchronization                                               │   │
│  │                                                                                  │   │
│  │  4. DISTRIBUTED LOCKS                                                           │   │
│  │     ├── Invoice number generation                                               │   │
│  │     ├── Concurrent edit prevention                                              │   │
│  │     └── Idempotency key storage                                                 │   │
│  │                                                                                  │   │
│  └─────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                          │
│  REAL-TIME UPDATE FLOW                                                                  │
│  ═════════════════════                                                                  │
│                                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐   │
│  │                                                                                  │   │
│  │  ┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐                   │   │
│  │  │ Server  │────▶│  Redis  │────▶│   SSE   │────▶│ Client  │                   │   │
│  │  │ Action  │     │ Pub/Sub │     │ Stream  │     │ Update  │                   │   │
│  │  └─────────┘     └─────────┘     └─────────┘     └─────────┘                   │   │
│  │                                                                                  │   │
│  │  1. Server action updates data                                                  │   │
│  │  2. Publishes event to Redis channel (tenant-scoped)                            │   │
│  │  3. SSE endpoint streams to connected clients                                   │   │
│  │  4. React components update via SWR mutation                                    │   │
│  │                                                                                  │   │
│  │  Channel naming: seumei:{tenant}:{resource}                                     │   │
│  │  Example: seumei:acme:invoices                                                  │   │
│  │                                                                                  │   │
│  └─────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘
\`\`\`

---

## 13. Telemetry & Observability

### 13.1 Observability Stack

\`\`\`
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                              TELEMETRY & OBSERVABILITY                                   │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  OBSERVABILITY PILLARS                                                                  │
│  ═════════════════════                                                                  │
│                                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐   │
│  │                                                                                  │   │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐                  │   │
│  │  │     LOGS        │  │    METRICS      │  │    TRACES       │                  │   │
│  │  ├─────────────────┤  ├─────────────────┤  ├─────────────────┤                  │   │
│  │  │                 │  │                 │  │                 │                  │   │
│  │  │ Structured JSON │  │ Business KPIs   │  │ Request tracing │                  │   │
│  │  │ Request context │  │ Technical perf  │  │ Distributed     │                  │   │
│  │  │ Error details   │  │ Resource usage  │  │ Span correlation│                  │   │
│  │  │                 │  │                 │  │                 │                  │   │
│  │  │ Tool: Axiom     │  │ Tool: Vercel    │  │ Tool: Vercel    │                  │   │
│  │  │ (via Vercel)    │  │ Analytics       │  │ (built-in)      │                  │   │
│  │  │                 │  │                 │  │                 │                  │   │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘                  │   │
│  │                                                                                  │   │
│  └─────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                          │
│  METRICS CATEGORIES                                                                     │
│  ══════════════════                                                                     │
│                                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐   │
│  │                                                                                  │   │
│  │  BUSINESS METRICS                                                               │   │
│  │  ├── tenants.active_daily                                                       │   │
│  │  ├── tenants.created_daily                                                      │   │
│  │  ├── invoices.created_daily                                                     │   │
│  │  ├── invoices.total_value_daily                                                 │   │
│  │  ├── payments.received_daily                                                    │   │
│  │  ├── nfe.emitted_daily                                                          │   │
│  │  └── users.active_daily                                                         │   │
│  │                                                                                  │   │
│  │  TECHNICAL METRICS                                                              │   │
│  │  ├── api.requests_total                                                         │   │
│  │  ├── api.latency_p50, api.latency_p95, api.latency_p99                          │   │
│  │  ├── api.errors_total                                                           │   │
│  │  ├── db.query_duration                                                          │   │
│  │  ├── db.connections_active                                                      │   │
│  │  ├── jobs.processed, jobs.failed                                                │   │
│  │  ├── cache.hit_rate                                                             │   │
│  │  └── webhooks.delivery_success_rate                                             │   │
│  │                                                                                  │   │
│  └─────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘
\`\`\`

---

## 14. Audit System

### 14.1 Audit Architecture

\`\`\`
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                              AUDIT SYSTEM ARCHITECTURE                                   │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  AUDIT LOG STRUCTURE                                                                    │
│  ═══════════════════                                                                    │
│                                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐   │
│  │                                                                                  │   │
│  │  AuditLog = {                                                                   │   │
│  │    id: ULID                          // Sortable unique ID                      │   │
│  │    user_id: UUID                     // Who performed the action                │   │
│  │    action: string                    // What was done (verb.noun)               │   │
│  │    entity_type: string               // Resource type                           │   │
│  │    entity_id: UUID                   // Resource ID                             │   │
│  │    old_data: JSONB | null            // Previous state                          │   │
│  │    new_data: JSONB | null            // New state                               │   │
│  │    metadata: {                                                                  │   │
│  │      ip_address: string                                                         │   │
│  │      user_agent: string                                                         │   │
│  │      location: string                                                           │   │
│  │      device: string                                                             │   │
│  │      request_id: string                                                         │   │
│  │    }                                                                            │   │
│  │    created_at: timestamp                                                        │   │
│  │  }                                                                              │   │
│  │                                                                                  │   │
│  └─────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                          │
│  AUDITED ACTIONS                                                                        │
│  ═══════════════                                                                        │
│                                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐   │
│  │                                                                                  │   │
│  │  CRITICAL (always logged)                                                       │   │
│  │  ├── auth.login, auth.logout, auth.failed                                       │   │
│  │  ├── workspace.created, workspace.deleted                                       │   │
│  │  ├── team.member_added, team.member_removed, team.role_changed                  │   │
│  │  ├── billing.plan_changed, billing.payment_failed                               │   │
│  │  ├── module.installed, module.uninstalled                                       │   │
│  │  └── settings.changed                                                           │   │
│  │                                                                                  │   │
│  │  FINANCIAL (always logged)                                                      │   │
│  │  ├── invoice.created, invoice.updated, invoice.cancelled, invoice.paid          │   │
│  │  ├── transaction.created, transaction.updated, transaction.deleted              │   │
│  │  ├── payment.received, payment.refunded                                         │   │
│  │  ├── nfe.emitted, nfe.cancelled                                                 │   │
│  │  └── pix.received, pix.refunded                                                 │   │
│  │                                                                                  │   │
│  │  DATA (configurable per tenant)                                                 │   │
│  │  ├── customer.created, customer.updated, customer.deleted                       │   │
│  │  ├── product.created, product.updated, product.deleted                          │   │
│  │  └── Any entity CRUD operations                                                 │   │
│  │                                                                                  │   │
│  └─────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘
\`\`\`

---

## 15. SEUMEI UI Design System

### 15.1 Component Architecture

\`\`\`
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                              SEUMEI UI DESIGN SYSTEM                                     │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  COMPONENT HIERARCHY                                                                    │
│  ═══════════════════                                                                    │
│                                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐   │
│  │                                                                                  │   │
│  │  LAYER 1: PRIMITIVES (Atomic)                                                   │   │
│  │  ────────────────────────────────────────────────────────────────────────────── │   │
│  │  Button | Input | Select | Checkbox | Radio | Switch | Textarea                │   │
│  │  Label | Badge | Avatar | Icon | Spinner | Skeleton                             │   │
│  │                                                                                  │   │
│  │  LAYER 2: COMPOSED (Molecules)                                                  │   │
│  │  ────────────────────────────────────────────────────────────────────────────── │   │
│  │  Card | Modal | Dialog | Sheet | Popover | Tooltip | Dropdown                   │   │
│  │  Alert | Toast | Tabs | Accordion | Table | Pagination                          │   │
│  │  Form | FormField | DatePicker | Combobox | Command                             │   │
│  │                                                                                  │   │
│  │  LAYER 3: PATTERNS (Organisms) - MEI-Specific                                   │   │
│  │  ────────────────────────────────────────────────────────────────────────────── │   │
│  │  DataTable (sort, filter, paginate, select, export)                             │   │
│  │  FormBuilder (dynamic form generation from schema)                              │   │
│  │  CommandMenu (⌘K search across all resources)                                   │   │
│  │  FileUpload (drag & drop, preview, progress)                                    │   │
│  │  MoneyInput (BRL formatting, validation)                                        │   │
│  │  DocumentInput (CPF/CNPJ auto-format, validation)                               │   │
│  │  PhoneInput (BR format with DDD)                                                │   │
│  │  AddressForm (CEP autocomplete, state/city)                                     │   │
│  │  EmptyState (no data states with actions)                                       │   │
│  │  ErrorBoundary (graceful error handling)                                        │   │
│  │                                                                                  │   │
│  │  LAYER 4: LAYOUTS (Templates)                                                   │   │
│  │  ────────────────────────────────────────────────────────────────────────────── │   │
│  │  DashboardShell (sidebar + header + content)                                    │   │
│  │  AuthLayout (centered card)                                                     │   │
│  │  SettingsLayout (tabs + content)                                                │   │
│  │  OnboardingLayout (stepper + content)                                           │   │
│  │  PublicPageLayout (invoice view, payment page)                                  │   │
│  │                                                                                  │   │
│  └─────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                          │
│  DESIGN TOKENS                                                                          │
│  ═════════════                                                                          │
│                                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐   │
│  │                                                                                  │   │
│  │  COLORS (Semantic)                                                              │   │
│  │  --color-background, --color-foreground                                         │   │
│  │  --color-primary, --color-primary-foreground                                    │   │
│  │  --color-secondary, --color-secondary-foreground                                │   │
│  │  --color-muted, --color-muted-foreground                                        │   │
│  │  --color-accent, --color-accent-foreground                                      │   │
│  │  --color-destructive, --color-success, --color-warning                          │   │
│  │                                                                                  │   │
│  │  TYPOGRAPHY                                                                     │   │
│  │  --font-sans: "Inter Variable", system-ui                                       │   │
│  │  --font-mono: "JetBrains Mono", monospace                                       │   │
│  │                                                                                  │   │
│  │  SPACING: 4px base unit (0.25rem)                                               │   │
│  │  RADIUS: --radius-sm (2px), --radius-md (6px), --radius-lg (12px)               │   │
│  │  SHADOWS: --shadow-sm, --shadow-md, --shadow-lg                                 │   │
│  │                                                                                  │   │
│  └─────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘
\`\`\`

---

## 16. External App Support

### 16.1 Partner App Integration

\`\`\`
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                              EXTERNAL APP SUPPORT                                        │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  INTEGRATION MODELS                                                                     │
│  ══════════════════                                                                     │
│                                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐   │
│  │                                                                                  │   │
│  │  MODEL 1: API INTEGRATION                                                       │   │
│  │  ────────────────────────────────────────────────────────────────────────────── │   │
│  │  Partner apps use REST API with API keys                                        │   │
│  │  - Scoped to specific tenant                                                    │   │
│  │  - Rate limited per plan                                                        │   │
│  │  - Full CRUD on authorized resources                                            │   │
│  │                                                                                  │   │
│  │  MODEL 2: WEBHOOK SUBSCRIPTIONS                                                 │   │
│  │  ────────────────────────────────────────────────────────────────────────────── │   │
│  │  Partner apps receive events via webhooks                                       │   │
│  │  - Subscribe to specific event types                                            │   │
│  │  - HMAC signature verification                                                  │   │
│  │  - Retry with exponential backoff                                               │   │
│  │                                                                                  │   │
│  │  MODEL 3: EMBEDDED APPS (Future)                                                │   │
│  │  ────────────────────────────────────────────────────────────────────────────── │   │
│  │  Partner apps embedded in SEUMEI dashboard                                      │   │
│  │  - iframe with postMessage communication                                        │   │
│  │  - OAuth 2.0 for authentication                                                 │   │
│  │  - Marketplace listing                                                          │   │
│  │                                                                                  │   │
│  └─────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                          │
│  SATELLITE APPS (Matriz Ecosystem)                                                      │
│  ══════════════════════════════════                                                     │
│                                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐   │
│  │                                                                                  │   │
│  │  SpotVibe (Events)                                                              │   │
│  │  ├── Uses: customers, invoices, payments                                        │   │
│  │  ├── Extends: Event management module                                           │   │
│  │  └── Integration: Full API + webhooks                                           │   │
│  │                                                                                  │   │
│  │  Harmonix (Music)                                                               │   │
│  │  ├── Uses: customers, invoices, payments                                        │   │
│  │  ├── Extends: Royalty management module                                         │   │
│  │  └── Integration: Full API + webhooks                                           │   │
│  │                                                                                  │   │
│  │  Pelada (Sports)                                                                │   │
│  │  ├── Uses: customers, invoices, payments                                        │   │
│  │  ├── Extends: Booking/scheduling module                                         │   │
│  │  └── Integration: Full API + webhooks                                           │   │
│  │                                                                                  │   │
│  │  MeuPintor (Services)                                                           │   │
│  │  ├── Uses: customers, invoices, products                                        │   │
│  │  ├── Extends: Service catalog module                                            │   │
│  │  └── Integration: Full API + webhooks                                           │   │
│  │                                                                                  │   │
│  │  MatrizPay (Payments)                                                           │   │
│  │  ├── Uses: All financial data                                                   │   │
│  │  ├── Extends: Payment processing core                                           │   │
│  │  └── Integration: Deep integration (shared codebase)                            │   │
│  │                                                                                  │   │
│  └─────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘
\`\`\`

---

## 17. Design Patterns Catalog

### 17.1 Core Patterns

\`\`\`
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                              DESIGN PATTERNS CATALOG                                     │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  ARCHITECTURAL PATTERNS                                                                 │
│  ══════════════════════                                                                 │
│                                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐   │
│  │                                                                                  │   │
│  │  1. CLEAN ARCHITECTURE                                                          │   │
│  │     ├── Domain layer: Pure business logic, no dependencies                      │   │
│  │     ├── Application layer: Use cases, orchestration                             │   │
│  │     ├── Infrastructure layer: External services, database                       │   │
│  │     └── Presentation layer: UI, API handlers                                    │   │
│  │                                                                                  │   │
│  │  2. REPOSITORY PATTERN                                                          │   │
│  │     ├── Abstract data access behind interfaces                                  │   │
│  │     ├── Domain defines repository contracts                                     │   │
│  │     └── Infrastructure implements with Kysely                                   │   │
│  │                                                                                  │   │
│  │  3. UNIT OF WORK                                                                │   │
│  │     ├── Transaction management across repositories                              │   │
│  │     ├── Atomic operations for complex workflows                                 │   │
│  │     └── Rollback on failure                                                     │   │
│  │                                                                                  │   │
│  │  4. CQRS (Command Query Responsibility Segregation)                             │   │
│  │     ├── Separate read and write models                                          │   │
│  │     ├── Optimized queries for read operations                                   │   │
│  │     └── Event-driven updates for write operations                               │   │
│  │                                                                                  │   │
│  │  5. EVENT SOURCING (for audit-critical operations)                              │   │
│  │     ├── Store events, not state                                                 │   │
│  │     ├── Rebuild state from event stream                                         │   │
│  │     └── Complete audit trail                                                    │   │
│  │                                                                                  │   │
│  └─────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                          │
│  DOMAIN PATTERNS                                                                        │
│  ═══════════════                                                                        │
│                                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐   │
│  │                                                                                  │   │
│  │  1. VALUE OBJECTS                                                               │   │
│  │     ├── Money (amount + currency, arithmetic operations)                        │   │
│  │     ├── Document (CPF/CNPJ validation, formatting)                              │   │
│  │     ├── Email (validation, normalization)                                       │   │
│  │     └── Phone (BR format validation)                                            │   │
│  │                                                                                  │   │
│  │  2. ENTITIES                                                                    │   │
│  │     ├── Identity-based equality                                                 │   │
│  │     ├── Encapsulated business rules                                             │   │
│  │     └── Domain events on state changes                                          │   │
│  │                                                                                  │   │
│  │  3. AGGREGATES                                                                  │   │
│  │     ├── Invoice (root) + InvoiceItems (children)                                │   │
│  │     ├── Transactional consistency boundary                                      │   │
│  │     └── Access children only through root                                       │   │
│  │                                                                                  │   │
│  │  4. DOMAIN SERVICES                                                             │   │
│  │     ├── Operations that don't belong to entities                                │   │
│  │     ├── InvoiceNumberGenerator                                                  │   │
│  │     └── PaymentProcessor                                                        │   │
│  │                                                                                  │   │
│  │  5. DOMAIN EVENTS                                                               │   │
│  │     ├── InvoiceCreated, PaymentReceived, etc.                                   │   │
│  │     ├── Decouple modules                                                        │   │
│  │     └── Trigger async workflows                                                 │   │
│  │                                                                                  │   │
│  └─────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                          │
│  INFRASTRUCTURE PATTERNS                                                                │
│  ═══════════════════════                                                                │
│                                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐   │
│  │                                                                                  │   │
│  │  1. TENANT CONTEXT                                                              │   │
│  │     ├── Middleware sets tenant context                                          │   │
│  │     ├── All queries scoped to tenant schema                                     │   │
│  │     └── Context propagated through call stack                                   │   │
│  │                                                                                  │   │
│  │  2. CIRCUIT BREAKER                                                             │   │
│  │     ├── Protect against external service failures                               │   │
│  │     ├── Fail fast when service is down                                          │   │
│  │     └── Automatic recovery                                                      │   │
│  │                                                                                  │   │
│  │  3. RETRY WITH BACKOFF                                                          │   │
│  │     ├── Exponential backoff for transient failures                              │   │
│  │     ├── Jitter to prevent thundering herd                                       │   │
│  │     └── Max retries with dead letter queue                                      │   │
│  │                                                                                  │   │
│  │  4. IDEMPOTENCY                                                                 │   │
│  │     ├── Idempotency keys for mutations                                          │   │
│  │     ├── Store in Redis with TTL                                                 │   │
│  │     └── Return cached response on duplicate                                     │   │
│  │                                                                                  │   │
│  │  5. SAGA PATTERN                                                                │   │
│  │     ├── Distributed transactions via Inngest                                    │   │
│  │     ├── Compensating actions on failure                                         │   │
│  │     └── Eventually consistent                                                   │   │
│  │                                                                                  │   │
│  └─────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘
\`\`\`

---

## 18. Data Flow Diagrams

### 18.1 Invoice Creation Flow

\`\`\`
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                              DATA FLOW: CREATE INVOICE                                   │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐   │
│  │                                                                                  │   │
│  │  ┌─────────┐                                                                    │   │
│  │  │  User   │                                                                    │   │
│  │  │ Browser │                                                                    │   │
│  │  └────┬────┘                                                                    │   │
│  │       │                                                                          │   │
│  │       │ 1. Submit invoice form                                                  │   │
│  │       ▼                                                                          │   │
│  │  ┌─────────────────────────────────────────────────────────────────────────┐    │   │
│  │  │                         SERVER ACTION                                    │    │   │
│  │  │                                                                          │    │   │
│  │  │  ┌──────────────────────────────────────────────────────────────────┐   │    │   │
│  │  │  │ 2. Validate input (Zod schema)                                   │   │    │   │
│  │  │  │ 3. Check permissions (can user create invoices?)                 │   │    │   │
│  │  │  │ 4. Get tenant context from session                               │   │    │   │
│  │  │  └──────────────────────────────────────────────────────────────────┘   │    │   │
│  │  │                              │                                           │    │   │
│  │  └──────────────────────────────┼───────────────────────────────────────────┘    │   │
│  │                                 │                                                │   │
│  │                                 ▼                                                │   │
│  │  ┌─────────────────────────────────────────────────────────────────────────┐    │   │
│  │  │                         INVOICE SERVICE                                  │    │   │
│  │  │                                                                          │    │   │
│  │  │  ┌──────────────────────────────────────────────────────────────────┐   │    │   │
│  │  │  │ 5. Load customer data                                            │   │    │   │
│  │  │  │ 6. Load product data for items                                   │   │    │   │
│  │  │  │ 7. Calculate totals (subtotal, discounts, taxes)                 │   │    │   │
│  │  │  │ 8. Generate invoice number (distributed lock)                    │   │    │   │
│  │  │  │ 9. Create Invoice aggregate                                      │   │    │   │
│  │  │  └──────────────────────────────────────────────────────────────────┘   │    │   │
│  │  │                              │                                           │    │   │
│  │  └──────────────────────────────┼───────────────────────────────────────────┘    │   │
│  │                                 │                                                │   │
│  │                                 ▼                                                │   │
│  │  ┌─────────────────────────────────────────────────────────────────────────┐    │   │
│  │  │                         REPOSITORY LAYER                                 │    │   │
│  │  │                                                                          │    │   │
│  │  │  ┌──────────────────────────────────────────────────────────────────┐   │    │   │
│  │  │  │ 10. Begin transaction                                            │   │    │   │
│  │  │  │ 11. Insert invoice record                                        │   │    │   │
│  │  │  │ 12. Insert invoice items                                         │   │    │   │
│  │  │  │ 13. Commit transaction                                           │   │    │   │
│  │  │  └──────────────────────────────────────────────────────────────────┘   │    │   │
│  │  │                              │                                           │    │   │
│  │  └──────────────────────────────┼───────────────────────────────────────────┘    │   │
│  │                                 │                                                │   │
│  │                                 ▼                                                │   │
│  │  ┌─────────────────────────────────────────────────────────────────────────┐    │   │
│  │  │                         EVENT BUS                                        │    │   │
│  │  │                                                                          │    │   │
│  │  │  ┌──────────────────────────────────────────────────────────────────┐   │    │   │
│  │  │  │ 14. Emit InvoiceCreated event                                    │   │    │   │
│  │  │  │     → Triggers Inngest workflow                                  │   │    │   │
│  │  │  └──────────────────────────────────────────────────────────────────┘   │    │   │
│  │  │                              │                                           │    │   │
│  │  └──────────────────────────────┼───────────────────────────────────────────┘    │   │
│  │                                 │                                                │   │
│  │       ┌─────────────────────────┴─────────────────────────┐                     │   │
│  │       │                                                   │                     │   │
│  │       ▼                                                   ▼                     │   │
│  │  ┌─────────────┐                                    ┌─────────────┐             │   │
│  │  │   Return    │                                    │   INNGEST   │             │   │
│  │  │  Response   │                                    │  WORKFLOW   │             │   │
│  │  │  to Client  │                                    │             │             │   │
│  │  └─────────────┘                                    │ 15. Gen PDF │             │   │
│  │                                                     │ 16. Upload  │             │   │
│  │                                                     │ 17. Email   │             │   │
│  │                                                     │ 18. PIX QR  │             │   │
│  │                                                     │ 19. Audit   │             │   │
│  │                                                     └─────────────┘             │   │
│  │                                                                                  │   │
│  └─────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘
\`\`\`

---

## 19. Security Architecture

### 19.1 Security Layers

\`\`\`
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                              SECURITY ARCHITECTURE                                       │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  DEFENSE IN DEPTH                                                                       │
│  ════════════════                                                                       │
│                                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐   │
│  │                                                                                  │   │
│  │  LAYER 1: NETWORK                                                               │   │
│  │  ├── Vercel Edge Network (DDoS protection)                                      │   │
│  │  ├── HTTPS only (TLS 1.3)                                                       │   │
│  │  ├── CORS configured per domain                                                 │   │
│  │  └── Rate limiting (Upstash)                                                    │   │
│  │                                                                                  │   │
│  │  LAYER 2: APPLICATION                                                           │   │
│  │  ├── Input validation (Zod schemas)                                             │   │
│  │  ├── SQL injection prevention (Kysely parameterized)                            │   │
│  │  ├── XSS prevention (React auto-escape)                                         │   │
│  │  ├── CSRF protection (SameSite cookies)                                         │   │
│  │  └── Content Security Policy headers                                            │   │
│  │                                                                                  │   │
│  │  LAYER 3: DATA                                                                  │   │
│  │  ├── Schema-per-tenant isolation                                                │   │
│  │  ├── RLS policies for user-level access                                         │   │
│  │  ├── Encryption at rest (Neon)                                                  │   │
│  │  ├── Encryption in transit (TLS)                                                │   │
│  │  ├── PII masking in logs                                                        │   │
│  │  └── Certificate A1 encrypted storage                                           │   │
│  │                                                                                  │   │
│  │  LAYER 4: AUTH                                                                  │   │
│  │  ├── Clerk (SOC 2 compliant)                                                    │   │
│  │  ├── MFA support                                                                │   │
│  │  ├── Session management                                                         │   │
│  │  ├── Permission-based access                                                    │   │
│  │  └── API key rotation                                                           │   │
│  │                                                                                  │   │
│  └─────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                          │
│  COMPLIANCE ROADMAP                                                                     │
│  ══════════════════                                                                     │
│                                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐   │
│  │                                                                                  │   │
│  │  v1.0: LGPD básico (consent, data deletion)                                     │   │
│  │  v2.0: Complete audit trail                                                     │   │
│  │  v3.0: SOC 2 Type I preparation                                                 │   │
│  │  v5.0: SOC 2 Type II, PCI-DSS (for SeuMEI Bank)                                 │   │
│  │                                                                                  │   │
│  └─────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘
\`\`\`

---

## 20. Deployment & Infrastructure

### 20.1 Deployment Architecture

\`\`\`
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                              DEPLOYMENT ARCHITECTURE                                     │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  ENVIRONMENTS                                                                           │
│  ════════════                                                                           │
│                                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐   │
│  │                                                                                  │   │
│  │  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐                        │   │
│  │  │ Development │     │   Preview   │     │ Production  │                        │   │
│  │  │  (local)    │     │  (PR-based) │     │  (main)     │                        │   │
│  │  └──────┬──────┘     └──────┬──────┘     └──────┬──────┘                        │   │
│  │         │                   │                   │                                │   │
│  │         ▼                   ▼                   ▼                                │   │
│  │  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐                        │   │
│  │  │ Neon Branch │     │ Neon Branch │     │ Neon Main   │                        │   │
│  │  │ (dev-xxx)   │     │ (pr-123)    │     │ (prod)      │                        │   │
│  │  └─────────────┘     └─────────────┘     └─────────────┘                        │   │
│  │                                                                                  │   │
│  └─────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                          │
│  CI/CD PIPELINE                                                                         │
│  ══════════════                                                                         │
│                                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐   │
│  │                                                                                  │   │
│  │  ┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐                   │   │
│  │  │  Lint   │────▶│  Type   │────▶│  Test   │────▶│  Build  │                   │   │
│  │  │         │     │  Check  │     │         │     │         │                   │   │
│  │  └─────────┘     └─────────┘     └─────────┘     └────┬────┘                   │   │
│  │                                                       │                         │   │
│  │                                         ┌─────────────┴─────────────┐           │   │
│  │                                         │                           │           │   │
