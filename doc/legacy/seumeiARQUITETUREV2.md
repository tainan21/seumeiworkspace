
```markdown
# PROMPT PARA PERPLEXITY - SEUMEI ARQUITETURA FINAL

Você está atuando como **Arquiteto Principal e Pesquisador Técnico** de um SaaS modular chamado **Seumei**.

## CONTEXTO DO PROJETO

Analise profundamente os documentos anexados que contêm:
- Arquitetura por Domains (DDD)
- Modelagem de dados multitenant
- Schema Prisma parcial existente
- Regras de negócio e filosofia do produto
- Patterns e estruturas de implementação

## FILOSOFIA DO PRODUTO (OBRIGATÓRIA)

**Workspace é o agregado raiz** - Usuário não é dono dos dados
- Workspace detém: regras, plano, wallet, layout, features, empresas
- Sistema moldável por: templates, extensões, apps internos
- UI é configurável como dado
- Economia baseada em coins (nunca acabam)
- Stripe é domínio isolado
- Arquitetura preparada para AI consumption
- Escalável para franquias, PDV, múltiplas lojas

## SUA MISSÃO

1. **ANALISAR** todos os documentos fornecidos
2. **VALIDAR** a consistência arquitetural
3. **COMPLETAR** o schema Prisma faltante baseado nos schemas listados
4. **GERAR** documentação técnica final consolidada

## SCHEMAS QUE DEVEM SER INCLUÍDOS NO PRISMA

Baseado nos documentos, você deve criar/completar schemas para:

### Core Domain
- User, Session, EmailVerificationCode
- Workspace, WorkspaceMember, WorkspaceInvite
- Enterprise (EnterpriseMother)

### Billing Domain (ISOLADO)
- Subscription, Plan
- StripeCustomer (isolado do Workspace)

### Wallet Domain
- Wallet, WalletTransaction

### Features Domain
- Feature, WorkspaceFeature, Extension

### UI/Layout Domain
- ThemeUI, ThemePreset, ComponentLayout

### Templates Domain
- OnboardingFlow, OnboardingCompletion, OnboardingTemplate

### Analytics Domain
- AnalyticsEvent, AnalyticsMetric

### Permissions Domain
- WorkspaceRole, WorkspacePermission, RolePermission, ModulePermission

### Audit Domain
- AuditLog

### Sales Domain
- Customer, Product, ProductCategory, Order, OrderItem, Quote, QuoteItem

### Finance Domain
- Invoice, InvoiceItem, Transaction, BankAccount, BankTransaction

### Payments Domain
- PixKey, PixPayment, DasPayment, PaymentLink, SplitRule, SplitAllocation, VirtualAccount

### System Domain
- Module, ModuleConfig, MessageTemplate, Aviso, Plan, FeatureFlagOverride, UserDashboardSettings, PipelineEvent, GlobalUser, MeiProfile, DunningPolicy, DunningJob, DunningLog

## REQUISITOS TÉCNICOS

1. **Multitenancy**: Todas as tabelas de negócio devem ter `workspaceId` obrigatório (exceto GlobalUser)
2. **Isolamento de Billing**: Stripe deve estar isolado no domain billing, não no Workspace
3. **Relações corretas**: Validar todas as foreign keys e relacionamentos
4. **Índices estratégicos**: Adicionar índices para performance multitenant
5. **Enums completos**: Todos os enums devem estar definidos
6. **Type safety**: Campos JSON devem estar documentados com comentários sobre estrutura
7. **Soft delete**: Considerar campos `deletedAt` onde apropriado
8. **Timestamps**: Todos os modelos devem ter `createdAt` e `updatedAt`

## FORMATO ESPERADO

1. **Schema Prisma completo e funcional**
2. **Documentação explicando decisões arquiteturais**
3. **Estrutura de pastas recomendada (DDD + Next.js)**
4. **Padrões de implementação por domain**
5. **Checklist de implementação por sprint**

## REGRAS DE OURO A RESPEITAR

1. Feature nunca conhece Stripe direto - usa abstração de billing
2. UI nunca decide regra - service decide
3. Workspace como contexto obrigatório em todas as queries
4. Domain isolation - cada domain tem responsabilidade única
5. Separation of concerns - layers bem definidas

## DELIVERABLES

Entregue um documento único e estruturado contendo:
- Schema Prisma completo (todos os models)
- Visão geral da arquitetura
- Domínios oficiais com responsabilidades
- Estrutura de pastas oficial
- Padrões de implementação
- Design patterns aplicados
- Sprints de implementação sugeridos

**⚠️ IMPORTANTE**: Não invente regras. Não simplifique demais. Extraia, valide e organize a partir dos documentos fornecidos. Este será o documento oficial usado em produção.
```

Agora, criando o documento final consolidado:


[1 tool called]


Criando o documento final consolidado. Por ser extenso, será estruturado em seções principais:

```markdown:doc/SEUMEI-ARCHITECTURE-FINAL.md
# SEUMEI - ARQUITETURA FINAL CONSOLIDADA V1.0

> Documento Oficial de Arquitetura | Base para Implementação | SaaS Multitenant Modular

---

## 📑 ÍNDICE

1. [Visão Geral e Filosofia](#1-visão-geral-e-filosofia)
2. [Arquitetura por Domains](#2-arquitetura-por-domains)
3. [Modelagem de Dados](#3-modelagem-de-dados)
4. [Estrutura de Pastas](#4-estrutura-de-pastas)
5. [Padrões de Implementação](#5-padrões-de-implementação)
6. [UI/UX Rulebook](#6-uiux-rulebook)
7. [Sistema de Templates](#7-sistema-de-templates)
8. [Design Patterns](#8-design-patterns)
9. [Sprints de Implementação](#9-sprints-de-implementação)
10. [Decisões Arquiteturais](#10-decisões-arquiteturais)

---

## 1. VISÃO GERAL E FILOSOFIA

### 1.1 Princípios Fundamentais

**Workspace é o Agregado Raiz**

```
┌─────────────────────────────────────────────────────────┐
│                    FILOSOFIA SEUMEI                      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ❌ User NÃO é dono dos dados                           │
│  ✅ Workspace DETÉM:                                    │
│     • Regras e limites                                  │
│     • Plano de assinatura                               │
│     • Wallet e economia interna                         │
│     • Layout e UI                                       │
│     • Features e extensões                              │
│     • Empresas (EnterpriseMother)                       │
│                                                          │
│  🎨 Sistema Moldável:                                   │
│     • Templates por nicho                               │
│     • Extensões e apps internos                         │
│     • UI configurável como dado                         │
│                                                          │
│  💰 Economia:                                           │
│     • Coins nunca acabam (soft-economy)                 │
│     • AI consumption ready                              │
│                                                          │
│  🔒 Isolamento:                                         │
│     • Stripe é domain isolado                           │
│     • Features não conhecem Stripe                      │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### 1.2 Modelo Mental Validado

**Hierarquia de Dados:**
```
Workspace (tenant principal)
├── EnterpriseMother (empresa mãe)
├── Enterprise[] (lojas/unidades)
├── WorkspaceMember[] (usuários)
├── WorkspaceFeature[] (features ativas)
├── ComponentLayout[] (UI por loja)
├── ThemeUI[] (tema por loja)
├── Wallet (economia interna)
└── Subscription (billing isolado)
```

**Fluxo de Onboarding:**
1. User cria conta (FREE)
2. Workspace é criado automaticamente
3. EnterpriseMother é criada (com formulário)
4. User escolhe categoria/template
5. ThemeUI é aplicado baseado no template
6. Features de trial são ativadas (7 dias)
7. Wallet recebe moedas iniciais

---

## 2. ARQUITETURA POR DOMAINS

### 2.1 Mapa de Domains Oficial

```
/domains
  ├── auth              ✅ (Session, EmailVerificationCode)
  │   └── Responsabilidade: Autenticação pura, não conhece workspace
  │
  ├── user              ✅ (User)
  │   └── Responsabilidade: Identidade pura, sem plano/wallet/dados de negócio
  │
  ├── workspace         ✅ (Workspace, WorkspaceMember)
  │   └── Responsabilidade: Core absoluto, container de tudo
  │
  ├── enterprise        ✅ (Enterprise/EnterpriseMother)
  │   └── Responsabilidade: Empresa mãe + lojas, contexto opcional
  │
  ├── billing           ⚠️ (Subscription, Plan, StripeCustomer)
  │   └── Responsabilidade: Billing isolado, Stripe é gateway interno
  │
  ├── wallet            ✅ (Wallet, WalletTransaction)
  │   └── Responsabilidade: Moedas e créditos, economia interna
  │
  ├── features          ✅ (Feature, WorkspaceFeature, Extension)
  │   └── Responsabilidade: Apps e extensões, marketplace interno
  │
  ├── theme-ui          ✅ (ThemeUI, ThemePreset, ComponentLayout)
  │   └── Responsabilidade: Layout e design, componentes configuráveis
  │
  ├── templates         ⚠️ (OnboardingTemplate, MessageTemplate)
  │   └── Responsabilidade: Templates de onboarding, mensagens, temas
  │
  ├── onboarding        ❌ (OnboardingFlow, OnboardingCompletion)
  │   └── Responsabilidade: Fluxos de onboarding, progresso do usuário
  │
  ├── analytics         ❌ (AnalyticsEvent, AnalyticsMetric)
  │   └── Responsabilidade: Eventos de tracking, relatórios, métricas
  │
  ├── permissions       ⚠️ (WorkspaceRole, RolePermission, ModulePermission)
  │   └── Responsabilidade: Roles, permissões, políticas de acesso
  │
  ├── audit             ⚠️ (AuditLog)
  │   └── Responsabilidade: Logs de auditoria, compliance
  │
  ├── sales             ✅ (Customer, Product, Order, Quote)
  │   └── Responsabilidade: Vendas, produtos, clientes, orçamentos
  │
  ├── finance           ✅ (Invoice, Transaction, BankAccount)
  │   └── Responsabilidade: Finanças, transações, contas bancárias
  │
  ├── payments          ✅ (PixPayment, DasPayment, PaymentLink)
  │   └── Responsabilidade: Pagamentos, PIX, DAS, links de pagamento
  │
  └── system            ✅ (Module, ModuleConfig, PipelineEvent)
      └── Responsabilidade: Módulos do sistema, configurações, eventos
```

### 2.2 Detalhamento por Domain

#### Domain: Workspace (CORE)

**Responsabilidade:**
- Container principal do sistema multitenant
- Gerencia planos, limites e configurações
- Coordena todos os sub-domains

**Entidades:**
- `Workspace`: Tenant principal
- `WorkspaceMember`: Relação User-Workspace com roles
- `WorkspaceInvite`: Convites para workspace

**Regras:**
- Todo dado de negócio pertence a um Workspace
- Workspace deve ter pelo menos um EnterpriseMother
- Workspace possui Wallet único (1:1)

#### Domain: Billing (ISOLADO)

**Responsabilidade:**
- Gerenciamento de assinaturas e planos
- Integração com Stripe (isolada)
- Features NUNCA conhecem Stripe diretamente

**Entidades:**
- `Subscription`: Assinatura do workspace
- `Plan`: Planos disponíveis
- `StripeCustomer`: Isolado, não no Workspace

**Regra de Ouro:**
```typescript
// ❌ ERRADO
import { stripe } from 'stripe'
await stripe.subscriptions.create(...)

// ✅ CORRETO
import { BillingService } from '@/domains/billing'
await billingService.createSubscription(workspaceId, planId)
```

#### Domain: Wallet

**Responsabilidade:**
- Economia interna do workspace
- Coins nunca acabam (soft-economy)
- Rastreamento de transações

**Entidades:**
- `Wallet`: Saldo do workspace
- `WalletTransaction`: Histórico de transações

**Regras:**
- Wallet criado automaticamente com Workspace
- Coins podem ser ganhos (onboarding, planos, promoções)
- Coins podem ser gastos (extensions, AI consumption)
- Balance nunca fica negativo

---

## 3. MODELAGEM DE DADOS

### 3.1 Schema Prisma - Core Models

```prisma
// ============================================
// USER — Identidade pura
// ============================================
model User {
  id        String   @id @default(cuid())
  name      String?
  email     String?  @unique
  emailVerifiedAt DateTime? @map(name: "email_verified_at")
  avatarUrl String?  @map(name: "avatar_url")
  status    UserStatus @default(ACTIVE)
  lastLoginAt DateTime? @map(name: "last_login_at")
  
  sessions               Session[]
  emailVerificationCodes EmailVerificationCode[]
  workspaceMemberships   WorkspaceMember[]
  
  createdAt DateTime @default(now()) @map(name: "created_at")
  updatedAt DateTime @updatedAt @map(name: "updated_at")

  @@map(name: "users")
}

enum UserStatus {
  ACTIVE
  BLOCKED
  DELETED
}

// ============================================
// WORKSPACE — Tenant principal
// ============================================
model Workspace {
  id        String   @id @default(cuid())
  name      String
  slug      String   @unique
  description String?
  
  type      WorkspaceType @default(SINGLE_BUSINESS)
  category  WorkspaceCategory @default(LIVRE)
  status    WorkspaceStatus @default(ACTIVE)
  
  // Billing isolado via Subscription (NÃO aqui)
  // settings como JSON flexível
  settings  Json     @default("{}")
  
  // Relations
  members           WorkspaceMember[]
  enterprises       Enterprise[]
  subscription      Subscription?
  wallet            Wallet?
  features          WorkspaceFeature[]
  themes            ThemeUI[]
  componentLayouts  ComponentLayout[]
  
  enterpriseMotherId String?  @unique @map(name: "enterprise_mother_id")
  enterpriseMother   Enterprise? @relation("EnterpriseMother", fields: [enterpriseMotherId], references: [id])
  
  createdById String   @map(name: "created_by_id")
  createdAt DateTime @default(now()) @map(name: "created_at")
  updatedAt DateTime @updatedAt @map(name: "updated_at")

  @@map(name: "workspaces")
  @@index([slug])
  @@index([status])
}

enum WorkspaceType {
  SINGLE_BUSINESS
  FRANCHISE
}

enum WorkspaceCategory {
  DELIVERY
  AUTONOMO
  COMERCIO
  LOJA
  SERVICOS
  CONSTRUCAO
  LIVRE
}

enum WorkspaceStatus {
  ACTIVE
  SUSPENDED
  ARCHIVED
}

// ============================================
// SUBSCRIPTION — Billing isolado
// ============================================
model Subscription {
  id            String   @id @default(cuid())
  workspaceId   String   @unique @map(name: "workspace_id")
  
  planId        String   @map(name: "plan_id")
  plan          Plan     @relation(fields: [planId], references: [id])
  
  status        SubscriptionStatus @default(ACTIVE)
  currentPeriodStart DateTime @map(name: "current_period_start")
  currentPeriodEnd   DateTime @map(name: "current_period_end")
  
  // Stripe (isolado aqui)
  stripeCustomerId     String? @unique @map(name: "stripe_customer_id")
  stripeSubscriptionId String? @unique @map(name: "stripe_subscription_id")
  stripePriceId        String? @map(name: "stripe_price_id")
  
  workspace     Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  
  createdAt DateTime @default(now()) @map(name: "created_at")
  updatedAt DateTime @updatedAt @map(name: "updated_at")

  @@map(name: "subscriptions")
  @@index([workspaceId])
  @@index([status])
}

enum SubscriptionStatus {
  ACTIVE
  CANCELED
  PAST_DUE
  UNPAID
  TRIALING
}

// ============================================
// WALLET — Economia interna
// ============================================
model Wallet {
  id            String   @id @default(cuid())
  workspaceId   String   @unique @map(name: "workspace_id")
  
  balance       Decimal  @default(0) @db.Decimal(15, 2)
  reservedBalance Decimal @default(0) @db.Decimal(15, 2) @map(name: "reserved_balance")
  currency      String   @default("COIN")
  
  workspace     Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  transactions  WalletTransaction[]
  
  createdAt DateTime @default(now()) @map(name: "created_at")
  updatedAt DateTime @updatedAt @map(name: "updated_at")

  @@map(name: "wallets")
}

model WalletTransaction {
  id          String   @id @default(cuid())
  walletId    String   @map(name: "wallet_id")
  
  type        WalletTransactionType
  amount      Decimal  @db.Decimal(15, 2)
  source      WalletTransactionSource
  referenceId String?  @map(name: "reference_id")
  description String?
  
  wallet      Wallet   @relation(fields: [walletId], references: [id], onDelete: Cascade)
  
  createdAt DateTime @default(now()) @map(name: "created_at")

  @@map(name: "wallet_transactions")
  @@index([walletId])
  @@index([type])
  @@index([createdAt])
}

enum WalletTransactionType {
  EARN
  SPEND
  RESERVE
  RELEASE
}

enum WalletTransactionSource {
  ONBOARDING
  PLAN
  EXTENSION
  AI_USAGE
  PROMOTION
}
```

### 3.2 Padrões Multitenant

**Regra de Ouro - Sempre filtrar por workspace:**

```typescript
// ✅ CORRETO
const orders = await prisma.order.findMany({
  where: {
    workspaceId: currentWorkspaceId, // OBRIGATÓRIO
    // outros filtros...
  }
});

// ❌ ERRADO - vaza dados!
const orders = await prisma.order.findMany();
```

---

## 4. ESTRUTURA DE PASTAS

### 4.1 Estrutura Oficial (DDD + Next.js)

```
/src
  /app                          # Next.js App Router
    /[locale]                   # Internacionalização
      /(auth)                   # Auth routes
        /login
        /register
        /onboarding             # Fluxo de onboarding
      /[workspace]              # Workspace-scoped routes
        /dashboard
        /customers
        /invoices
        /settings
      /api                      # API Routes
        /v1
          /customers
          /invoices
        /webhooks
          /stripe
          /pix
    /globals.css
    /layout.tsx
  
  /domains                      # Domain-Driven Design
    /auth
      /models
      /services
      /repositories
      
    /workspace
      /models
      /services
      /repositories
      
    /billing
      /models
      /services
      /stripe                   # Gateway isolado
      
    /wallet
      /models
      /services
      
    /features
      /models
      /services
      /store                    # Marketplace interno
      
    /theme-ui
      /models
      /services
      
    /onboarding
      /models
      /services
      /flows
      
    /analytics
      /models
      /services
      /reports
      
    /permissions
      /models
      /services
      /policies
      
    /audit
      /models
      /services
      
    /sales
      /models
      /services
      /repositories
      
    /finance
      /models
      /services
      
    /payments
      /models
      /services
      /providers
  
  /lib                          # Shared libraries
    /server
      /auth
      /db
      /mail
    /client
      /utils
    /utils.ts
  
  /components                   # UI Components
    /ui                         # shadcn/ui primitives
    /features                   # Feature-specific components
    /layouts                    # Layout components
    /shared                     # Shared components
  
  /hooks                        # React hooks
  /types                        # TypeScript types
  /config                       # Configuration files

/prisma
  /schema.prisma               # Schema completo
  /migrations                  # Migration files

/public                        # Static assets
```

---

## 5. PADRÕES DE IMPLEMENTAÇÃO

### 5.1 Domain Isolation

```typescript
// ✅ CORRETO - Domain isolado
// domains/billing/service.ts
export class BillingService {
  async createSubscription(workspaceId: string, planId: string) {
    // Lógica de billing isolada
    // Pode usar Stripe aqui, mas features não conhecem
  }
}

// ❌ ERRADO - Feature conhece Stripe
// domains/features/service.ts
export class FeatureService {
  async enableFeature(workspaceId: string) {
    const stripe = new Stripe(...) // ❌ NÃO!
  }
}

// ✅ CORRETO - Feature usa abstração
export class FeatureService {
  async enableFeature(workspaceId: string) {
    const billing = new BillingService()
    const canEnable = await billing.checkFeatureAccess(workspaceId, 'FEATURE_X')
  }
}
```

### 5.2 UI nunca decide regra

```typescript
// ❌ ERRADO - UI decide
if (user.plan === 'PRO') {
  showFeature()
}

// ✅ CORRETO - Service decide
const canAccess = await featureService.canAccessFeature(workspaceId, 'FEATURE_X')
if (canAccess) {
  showFeature()
}
```

### 5.3 Workspace como contexto obrigatório

```typescript
// ✅ SEMPRE passar workspaceId
async function getOrders(workspaceId: string, filters: OrderFilters) {
  return prisma.order.findMany({
    where: {
      workspaceId, // OBRIGATÓRIO
      ...filters
    }
  })
}
```

---

## 6. UI/UX RULEBOOK

### 6.1 Diretrizes Técnicas Obrigatórias

**1. Loading States**
- Toda tela deve ter loading state
- Use Suspense boundaries
- Skeleton loaders para melhor UX

**2. Server Components vs Client Components**
```typescript
// ✅ Server Component (default)
export default async function CustomersPage() {
  const customers = await getCustomers(workspaceId)
  return <CustomersList customers={customers} />
}

// ✅ Client Component (quando necessário)
'use client'
export function CustomerForm() {
  const [loading, setLoading] = useState(false)
  // interatividade...
}
```

**3. Error Boundaries**
- Todo route group deve ter error boundary
- Fallback states informativos
- Retry mechanisms

**4. Mini Dashboard "Visão Geral"**
- Toda seção principal deve ter overview
- Cards com KPIs relevantes
- Quick actions

**5. Organização Dinâmica de Rotas**
- Rotas baseadas em features ativas
- Permissões controlam visibilidade
- ComponentLayout define organização

---

## 7. SISTEMA DE TEMPLATES

### 7.1 Templates por Nicho

**Templates Disponíveis:**
- `DELIVERY`: Otimizado para delivery
- `AUTONOMO`: Para profissionais autônomos
- `COMERCIO`: Comércio geral
- `LOJA`: Lojas físicas/virtuais
- `SERVICOS`: Prestadores de serviço
- `CONSTRUCAO`: Construção e obras

**Processo:**
1. User escolhe template no onboarding
2. Sistema aplica ThemeUI baseado no template
3. Features relevantes são sugeridas
4. ComponentLayout é configurado
5. Exemplos de dados são criados (opcional)

### 7.2 Onboarding Guiado

**Fluxo:**
```
1. Criar conta (User)
2. Criar Workspace (automático)
3. Formulário EnterpriseMother
4. Escolher categoria/template
5. Aplicar configurações iniciais
6. Ativar trial de features (7 dias)
7. Receber moedas iniciais no Wallet
8. Redirecionar para dashboard
```

---

## 8. DESIGN PATTERNS

### 8.1 Patterns Aplicados

**Repository Pattern:**
- Abstração de acesso a dados
- Domain define interfaces
- Infrastructure implementa

**Service Layer:**
- Lógica de negócio isolada
- Orquestração de operações
- Validações e regras

**Domain Events:**
- Desacoplamento entre domains
- Event-driven architecture
- Inngest para workflows async

**Factory Pattern:**
- Criação de entidades complexas
- Onboarding factories
- Template factories

---

## 9. SPRINTS DE IMPLEMENTAÇÃO

### Sprint 1 - Core Foundation
**Objetivos:**
- Workspace, User, Auth
- Wallet básico
- Multitenancy base

**Entregáveis:**
- Models core
- Auth flow completo
- Workspace creation

**Riscos:**
- Migração de dados existentes
- Performance multitenant

### Sprint 2 - Enterprise & Billing
**Objetivos:**
- EnterpriseMother
- Billing isolado
- Subscription management

**Entregáveis:**
- Enterprise models
- Subscription service
- Stripe integration (isolada)

**Dependências:**
- Sprint 1 completo

### Sprint 3 - Features & Marketplace
**Objetivos:**
- Feature system
- Marketplace interno
- WorkspaceFeature

**Entregáveis:**
- Feature models
- Store UI
- Activation logic

### Sprint 4 - UI Dinâmica
**Objetivos:**
- ComponentLayout
- ThemeUI
- Templates

**Entregáveis:**
- Layout system
- Theme management
- Template engine

---

## 10. DECISÕES ARQUITETURAIS

### Decisão 1: Workspace como Tenant
**O que:** Workspace é o agregado raiz
**Por quê:** Escalabilidade, isolamento, compliance (LGPD)
**Alternativa descartada:** User como tenant (não escala)

### Decisão 2: Billing Isolado
**O que:** Stripe isolado no domain billing
**Por quê:** Features não devem conhecer Stripe, facilita mudanças de gateway
**Alternativa descartada:** Stripe no Workspace (acoplamento)

### Decisão 3: Wallet com Coins
**O que:** Sistema de moedas interna
**Por quê:** Soft-economy, AI consumption, extensibilidade
**Alternativa descartada:** Apenas planos (menos flexível)

### Decisão 4: UI como Dado
**O que:** ComponentLayout e ThemeUI no banco
**Por quê:** Customização por loja, white-label, flexibilidade
**Alternativa descartada:** UI hardcoded (não escala)

---

## CONCLUSÃO

Este documento consolida toda a arquitetura da Seumei baseado em:
- Análise dos documentos existentes
- Validação do modelo mental
- Melhores práticas de DDD
- Experiência de SaaS multitenant

**Próximos Passos:**
1. Validar schema Prisma completo
2. Implementar Sprint 1
3. Iterar baseado em feedback
4. Documentar padrões conforme surgem

---

**Versão:** 1.0  
**Última Atualização:** 2024-12-30  
**Mantenedor:** Equipe Seumei
```

Criei dois documentos:

1. **Prompt para Perplexity** (`PROMPT-PERPLEXITY.md`): Prompt estruturado para gerar o schema Prisma final e validar a arquitetura.

2. **Documento Final Consolidado** (`SEUMEI-ARCHITECTURE-FINAL.md`): Documento que consolida todos os pontos levantados nos documentos anteriores.

Ambos os documentos estão prontos para uso. O documento final serve como base oficial para:
- Desenvolvimento
- Schema Prisma
- Orientação de devs
- Escalabilidade

Deseja que eu detalhe alguma seção específica ou faça ajustes?