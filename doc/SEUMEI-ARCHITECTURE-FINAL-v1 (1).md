> Documento Oficial de Arquitetura | Base para Implementação em Produção  
> SaaS Multitenant Modular para Microempreendedores Individuais (MEI)

---

## 📑 ÍNDICE

1. [Visão Geral e Filosofia](#1-visão-geral-e-filosofia)
2. [Arquitetura por Domains (DDD)](#2-arquitetura-por-domains)
3. [Modelagem de Dados Completa](#3-modelagem-de-dados-completa)
4. [Schema Prisma Oficial](#4-schema-prisma-oficial)
5. [Estrutura de Pastas (DDD + Next.js)](#5-estrutura-de-pastas)
6. [Padrões de Implementação](#6-padrões-de-implementação)
7. [UI/UX Rulebook](#7-uiux-rulebook)
8. [Sistema de Templates](#8-sistema-de-templates)
9. [Design Patterns Aplicados](#9-design-patterns)
10. [Fluxos de Negócio](#10-fluxos-de-negócio)
11. [Sprints de Implementação](#11-sprints-de-implementação)
12. [Decisões Arquiteturais](#12-decisões-arquiteturais)
13. [Checklist de Implementação](#13-checklist)

---

## 1. VISÃO GERAL E FILOSOFIA

### 1.1 Princípios Fundamentais

**SEUMEI** é um SaaS modular, multitenant, escalável e moldável, projetado **exclusivamente para MEIs brasileiros**. Funciona como engine central do ecossistema Matriz (SpotVibe, Harmonix, Pelada, MeuPintor, MatrizPay).

```
┌──────────────────────────────────────────────────────────────────┐
│                    FILOSOFIA DA SEUMEI                            │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  🏗️  WORKSPACE É O AGREGADO RAIZ                                 │
│     ❌ Usuário NÃO é dono dos dados                              │
│     ✅ Workspace DETÉM:                                          │
│        • Regras e limites de uso                                 │
│        • Plano de assinatura e billing                           │
│        • Wallet e economia interna (coins)                       │
│        • Layout e UI (moldável por loja)                         │
│        • Features e extensões ativas                             │
│        • Empresas (EnterpriseMother + lojas)                     │
│                                                                   │
│  🎨  SISTEMA MOLDÁVEL                                            │
│     • Templates por nicho/categoria                              │
│     • Extensões e apps internos (marketplace)                    │
│     • UI configurável como dado (ComponentLayout)                │
│     • Temas customizáveis por loja (ThemeUI)                     │
│                                                                   │
│  💰  ECONOMIA SOFT (COINS)                                       │
│     • Coins nunca acabam                                         │
│     • Ganhos: onboarding, planos, promoções                      │
│     • Gastos: extensões, AI consumption                          │
│     • IA-ready: prepared para AI consumption                     │
│                                                                   │
│  🔒  ISOLAMENTO TOTAL                                            │
│     • Stripe como domain isolado (não conhece features)          │
│     • Features usam abstração de billing                         │
│     • Dados isolados por workspace (multitenancy)                │
│                                                                   │
│  📈  ESCALABILIDADE                                              │
│     • Franquias: múltiplas lojas por workspace                   │
│     • PDV: múltiplos pontos de venda                             │
│     • Suporta 100K+ workspaces com isolation total               │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

### 1.2 Invariantes do Modelo

```
┌─────────────────────────────────────────────────────────────────┐
│           INVARIANTES (Regras que NUNCA podem ser quebradas)     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  INV-1: Workspace como Tenant                                    │
│  → Todos os dados de negócio OBRIGATORIAMENTE pertencem a um    │
│    workspace                                                     │
│  → RLS (Row Level Security) implementado em todas as tabelas    │
│  → Queries SEMPRE filtram por workspaceId                       │
│                                                                  │
│  INV-2: Feature Nunca Conhece Stripe                             │
│  → Feature não importa/usa Stripe diretamente                    │
│  → Features usam abstração de BillingService                    │
│  → Stripe isolado em domain/billing                              │
│                                                                  │
│  INV-3: UI Nunca Decide Regra de Negócio                         │
│  → Componentes não contêm lógica de plano/permissão             │
│  → Service/server-action decide se feature disponível           │
│  → UI apenas renderiza baseado em decisão do service            │
│                                                                  │
│  INV-4: Workspace Como Contexto Obrigatório                      │
│  → Toda função que acessa dados do negócio recebe workspaceId   │
│  → Não existe query que acessa dados sem workspaceId            │
│  → Middleware valida workspace em todo request                  │
│                                                                  │
│  INV-5: Domain Isolation                                         │
│  → Cada domain tem responsabilidade única e clara                │
│  → Nenhum domain conhece implementação de outro                 │
│  → Comunicação via interfaces/contracts definidas                │
│                                                                  │
│  INV-6: Separation of Concerns (Camadas)                         │
│  → UI Layer: Renderização, interatividade, validação básica      │
│  → Application Layer: Orquestração, transformação de dados       │
│  → Domain Layer: Regras de negócio puro                          │
│  → Infrastructure Layer: Banco, APIs externas, Stripe            │
│                                                                  │
│  INV-7: Wallet Nunca Fica Negativo                               │
│  → Balance sempre >= 0                                           │
│  → Operações que causariam saldo negativo são rejeitadas         │
│  → Coins são "soft currency" (nunca acabam)                      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 1.3 Hierarquia de Dados

```
Workspace (tenant principal — 1:1 com empresa)
│
├─ WorkspaceMember[] (usuários do workspace)
│  └─ WorkspaceRole (OWNER, ADMIN, MANAGER, OPERATOR, VIEWER)
│
├─ Enterprise (empresa mãe ou principal)
│  └─ Enterprise[] (lojas/unidades adicionais) — opcional
│
├─ Subscription (1:1 — billing isolado)
│  └─ Plan
│
├─ Wallet (1:1 — economia interna)
│  └─ WalletTransaction[]
│
├─ WorkspaceFeature[] (features ativas)
│  └─ Feature (catalog)
│
├─ ThemeUI[] (temas por loja)
│  └─ ThemePreset (presets disponíveis)
│
├─ ComponentLayout[] (UI customizada por loja)
│
└─ Dados de Negócio (todos com workspaceId obrigatório)
   ├─ Customer, Order, Quote, Invoice
   ├─ Product, ProductCategory
   ├─ Transaction, BankAccount
   ├─ PixPayment, DasPayment, PaymentLink
   └─ ... (mais de 20 modelos)
```

---

## 2. ARQUITETURA POR DOMAINS

### 2.1 Mapa Oficial de Domains

```
/domains
│
├── auth
│   └─ Responsabilidade: Autenticação pura (Session, EmailVerification)
│   └─ Não conhece: Workspace, planos, dados
│   └─ Isolado: Sim (pode mudar provider facilmente)
│
├── user
│   └─ Responsabilidade: Identidade do usuário
│   └─ Não tem: Plano, wallet, dados de negócio
│   └─ Relacionado com: auth, workspace (via WorkspaceMember)
│
├── workspace ⭐ CORE
│   └─ Responsabilidade: Container principal, tenant, limites
│   └─ Detém: Plano, wallet, features, empresas
│   └─ Orquestra: Todos os outros domains
│
├── enterprise
│   └─ Responsabilidade: Empresa/loja (opcional, para franquias/PDV)
│   └─ Contexto: Cada workspace tem 1 empresa mãe + N lojas
│   └─ Uso: Isolamento por loja, temas por loja, layout por loja
│
├── billing ⚠️ ISOLADO
│   └─ Responsabilidade: Assinaturas, planos, stripe
│   └─ NUNCA conhecido por: Features, UI
│   └─ Acessado via: BillingService (abstração)
│   └─ Isolamento: Stripe é implementação, não conceito
│
├── wallet
│   └─ Responsabilidade: Moedas internas, transações
│   └─ Economia: Soft (coins nunca acabam)
│   └─ Usos: Compra de extensions, AI consumption
│
├── features
│   └─ Responsabilidade: Features/apps, marketplace interno
│   └─ Desacoplado de: Billing (via abstração)
│   └─ Store: Marketplace para compra/ativação
│   └─ Trial: Features podem expirar
│
├── theme-ui
│   └─ Responsabilidade: Layout, design, componentes
│   └─ Configurável: Por workspace, por enterprise/loja
│   └─ Flexível: Presets, temas custom, dark mode
│
├── templates
│   └─ Responsabilidade: Presets de temas, onboarding, mensagens
│   └─ Subdomínios: theme, onboarding, message
│
├── onboarding
│   └─ Responsabilidade: Fluxo inicial do usuário
│   └─ Progresso: OnboardingCompletion rastreia passos
│   └─ Inteligente: Pode sugerir features baseado em categoria
│
├── permissions
│   └─ Responsabilidade: Roles, permissões, políticas
│   └─ Granular: WorkspaceRole + RolePermission
│   └─ Modular: ModulePermission por módulo
│
├── analytics
│   └─ Responsabilidade: Eventos, métricas, relatórios
│   └─ Tracking: AnalyticsEvent, AnalyticsMetric
│   └─ IA-ready: Dados estruturados para ML
│
├── audit
│   └─ Responsabilidade: Logs auditória, compliance, segurança
│   └─ Mandatory: Toda ação importante é logged
│   └─ LGPD-ready: Dados de compliance desde dia 1
│
├── sales
│   └─ Responsabilidade: Vendas, clientes, pedidos, orçamentos
│   └─ Modelos: Customer, Order, Quote, OrderItem, QuoteItem
│   └─ Fluxo: Quote → Order → Invoice → Transaction
│
├── products
│   └─ Responsabilidade: Catálogo de produtos
│   └─ Organização: ProductCategory
│   └─ Vinculado: Orders, Quotes
│
├── finance
│   └─ Responsabilidade: Transações, contas bancárias
│   └─ Rastreamento: Invoice, Transaction, BankAccount, BankTransaction
│   └─ Conciliação: Importação e matching de transações
│
├── payments
│   └─ Responsabilidade: PIX, DAS, Payment Links, divisão
│   └─ Modelos: PixPayment, DasPayment, PaymentLink, SplitRule
│   └─ Flexível: Suporta múltiplos canais de pagamento
│
├── system
│   └─ Responsabilidade: Módulos do sistema, configs globais
│   └─ Modelos: Module, ModuleConfig, PipelineEvent
│   └─ Avisos: Aviso (notificações do sistema)
│   └─ Dunning: DunningPolicy, DunningJob, DunningLog
│
└── shared
    └─ Responsabilidade: Tipos comuns, utilitários, validações
    └─ Não tem modelos de negócio
    └─ Compartilhado entre todos os domains
```

### 2.2 Dependências Entre Domains

```
Camada de API (sem domínio específico)
         ↓
┌────────────────────────────────────────┐
│        DOMAIN: Workspace ⭐             │ ← Hub central
│ (container de tudo, orquestra outros)  │
└──────────┬──────────────────────────────┘
           │
    ┌──────┴──────────────────────────────────┐
    │                                          │
┌───▼────────┐  ┌──────────┐  ┌────────────┐  │
│   auth     │  │  user    │  │ enterprise │  │
└────────────┘  └──────────┘  └────────────┘  │
    │                                          │
    └──────────────────────────────────────────┤
                                               │
          ┌─────────────────────────────────┐  │
          │  billing 🔒 (isolado)           │  │
          │  ├─ Subscription                │  │
          │  ├─ Plan                        │  │
          │  └─ Stripe (gateway interno)    │  │
          └─────────────────────────────────┘  │
               │                                 │
               ├─ features (via BillingService) │
               ├─ permissions (via service)     │
               └─ wallet (moedas como recurso)  │
                                                │
          ┌─────────────────────────────────┐  │
          │  wallet                          │  │
          │  ├─ Wallet (saldo)               │  │
          │  └─ WalletTransaction (hist.)    │  │
          └─────────────────────────────────┘  │
               │                                 │
               └─ features (compra de extensões)│
                                                │
          ┌─────────────────────────────────┐  │
          │  features + marketplace          │  │
          │  ├─ Feature (catalog)            │  │
          │  ├─ WorkspaceFeature (estado)    │  │
          │  └─ Extension (marketplace)      │  │
          └─────────────────────────────────┘  │
               │                                 │
               ├─ analytics (eventos de uso)    │
               └─ permissions (acesso)          │
                                                │
          ┌─────────────────────────────────┐  │
          │  theme-ui                        │  │
          │  ├─ ThemeUI (por workspace/loja) │  │
          │  ├─ ThemePreset (templates)      │  │
          │  └─ ComponentLayout (UI config)  │  │
          └─────────────────────────────────┘  │
                                                │
          ┌─────────────────────────────────┐  │
          │  templates                       │  │
          │  ├─ theme                        │  │
          │  ├─ onboarding                   │  │
          │  └─ message                      │  │
          └─────────────────────────────────┘  │
                                                │
          ┌─────────────────────────────────┐  │
          │  onboarding                      │  │
          │  ├─ OnboardingFlow (fluxo)       │  │
          │  └─ OnboardingCompletion (prog.) │  │
          └─────────────────────────────────┘  │
               │                                 │
               ├─ theme (aplica template)       │
               ├─ features (ativa trial)        │
               └─ wallet (moedas iniciais)      │
                                                │
          ┌─────────────────────────────────┐  │
          │  permissions                     │  │
          │  ├─ WorkspaceRole               │  │
          │  ├─ RolePermission              │  │
          │  └─ ModulePermission            │  │
          └─────────────────────────────────┘  │
                                                │
          ┌─────────────────────────────────┐  │
          │  analytics                       │  │
          │  ├─ AnalyticsEvent              │  │
          │  └─ AnalyticsMetric             │  │
          └─────────────────────────────────┘  │
                                                │
          ┌─────────────────────────────────┐  │
          │  audit                           │  │
          │  └─ AuditLog                    │  │
          └─────────────────────────────────┘  │
                                                │
          ┌──────────────────────────────────────────────┐
          │  NEGÓCIO (Sales, Products, Finance, Payments) │
          │                                               │
          │  ├─ sales                                     │
          │  │  ├─ Customer, Order, Quote                │
          │  │  └─ OrderItem, QuoteItem                  │
          │  │                                            │
          │  ├─ products                                  │
          │  │  ├─ Product, ProductCategory              │
          │  │  └─ Vinculado: Orders, Quotes             │
          │  │                                            │
          │  ├─ finance                                   │
          │  │  ├─ Invoice, Transaction                   │
          │  │  └─ BankAccount, BankTransaction           │
          │  │                                            │
          │  └─ payments                                  │
          │     ├─ PixPayment, DasPayment                │
          │     ├─ PaymentLink                            │
          │     ├─ SplitRule, SplitAllocation             │
          │     └─ VirtualAccount                         │
          │                                               │
          └──────────────────────────────────────────────┘
               │                                           │
               ├─ analytics (eventos de negócio)           │
               ├─ audit (logs de transações)               │
               └─ system (dunning, avisos)                 │
                                                            │
          ┌──────────────────────────────┐                 │
          │  system                       │                │
          │  ├─ Module, ModuleConfig      │                │
          │  ├─ PipelineEvent (automação) │                │
          │  ├─ Aviso (notificações)      │                │
          │  ├─ MessageTemplate           │                │
          │  ├─ DunningPolicy/Job/Log     │                │
          │  └─ MeiProfile                │                │
          └──────────────────────────────┘
```

---

## 3. MODELAGEM DE DADOS COMPLETA

### 3.1 Estrutura Geral

Todos os modelos seguem padrão:
- `id`: CUID (distribuído)
- `workspaceId`: Obrigatório (exceto User, GlobalUser)
- `createdAt`, `updatedAt`: Timestamps
- `createdById`, `updatedById`: Auditoria opcional
- Índices em `workspaceId`, campos únicos, status

### 3.2 Modelos Core (Auth & Identity)

```prisma
// USER — Identidade pura
model User {
  id        String   @id @default(cuid())
  name      String?
  email     String?  @unique
  emailVerifiedAt DateTime?
  avatarUrl String?
  status    UserStatus @default(ACTIVE)
  lastLoginAt DateTime?
  
  sessions               Session[]
  emailVerificationCodes EmailVerificationCode[]
  workspaceMemberships   WorkspaceMember[]
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  @@map("users")
  @@index([email])
  @@index([status])
}

// SESSION — Autenticação
model Session {
  id        String   @id @default(cuid())
  userId    String
  token     String   @unique
  expiresAt DateTime
  
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  createdAt DateTime @default(now())
  @@map("sessions")
  @@index([userId])
  @@index([token])
  @@index([expiresAt])
}

// EMAIL VERIFICATION
model EmailVerificationCode {
  id        String   @id @default(cuid())
  userId    String
  code      String   @unique
  expiresAt DateTime
  
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  createdAt DateTime @default(now())
  @@map("email_verification_codes")
  @@index([userId])
  @@index([code])
  @@index([expiresAt])
}

enum UserStatus {
  ACTIVE
  BLOCKED
  DELETED
}
```

### 3.3 Modelos Workspace (CORE)

```prisma
// WORKSPACE — Tenant principal
model Workspace {
  id        String   @id @default(cuid())
  name      String
  slug      String   @unique
  description String?
  
  // Classificação
  type      WorkspaceType @default(SINGLE_BUSINESS)
  category  WorkspaceCategory @default(LIVRE)
  status    WorkspaceStatus @default(ACTIVE)
  
  // Settings flexíveis
  settings  Json     @default("{}")
  
  // Relações principais
  members           WorkspaceMember[]
  enterprises       Enterprise[]
  features          WorkspaceFeature[]
  wallet            Wallet?
  subscription      Subscription?
  themes            ThemeUI[]
  componentLayouts  ComponentLayout[]
  
  // Empresa mãe (1:1)
  enterpriseMotherId String?  @unique
  enterpriseMother   Enterprise? @relation("EnterpriseMother", fields: [enterpriseMotherId], references: [id], onDelete: SetNull)
  
  // Dados de negócio
  customers         Customer[]
  orders            Order[]
  quotes            Quote[]
  products          Product[]
  productCategories ProductCategory[]
  invoices          Invoice[]
  transactions      Transaction[]
  bankAccounts      BankAccount[]
  pixPayments       PixPayment[]
  dasPayments       DasPayment[]
  paymentLinks      PaymentLink[]
  meiProfiles       MeiProfile[]
  virtualAccounts   VirtualAccount[]
  auditLogs         AuditLog[]
  analyticsEvents   AnalyticsEvent[]
  analyticsMetrics  AnalyticsMetric[]
  
  // Sistema
  avisos            Aviso[]
  messageTemplates  MessageTemplate[]
  moduleConfigs     ModuleConfig[]
  splitRules        SplitRule[]
  dunningPolicies   DunningPolicy[]
  dunningJobs       DunningJob[]
  
  createdById String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@map("workspaces")
  @@index([slug])
  @@index([status])
  @@index([type])
  @@index([category])
}

enum WorkspaceType {
  SINGLE_BUSINESS    // Negócio único
  FRANCHISE          // Franquia (múltiplas unidades)
}

enum WorkspaceCategory {
  DELIVERY     // Serviço de delivery
  AUTONOMO     // Profissional autônomo
  COMERCIO     // Comércio geral
  LOJA         // Loja física/virtual
  SERVICOS     // Prestador de serviço
  CONSTRUCAO   // Obras e construção
  LIVRE        // Sem categoria (customizar depois)
}

enum WorkspaceStatus {
  ACTIVE      // Workspace ativo
  SUSPENDED   // Suspenso (pagamento pendente)
  ARCHIVED    // Arquivado
}

// WORKSPACE MEMBER — Usuário no workspace
model WorkspaceMember {
  id          String   @id @default(cuid())
  workspaceId String
  userId      String
  
  role        WorkspaceRole @default(VIEWER)
  permissions String[]    // Array de permissões customizadas
  isActive    Boolean  @default(true)
  
  workspace   Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  joinedAt    DateTime @default(now())
  lastActionAt DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@unique([workspaceId, userId])
  @@map("workspace_members")
  @@index([workspaceId])
  @@index([userId])
  @@index([role])
  @@index([isActive])
}

enum WorkspaceRole {
  OWNER      // Dono completo do workspace
  ADMIN      // Acesso administrativo
  MANAGER    // Pode criar/editar sub-recursos
  OPERATOR   // Operacional (PDV, entregas)
  VIEWER     // Apenas leitura
}

// WORKSPACE INVITE — Convites
model WorkspaceInvite {
  id          String   @id @default(cuid())
  workspaceId String
  email       String
  role        WorkspaceRole @default(VIEWER)
  
  token       String   @unique
  expiresAt   DateTime
  acceptedAt  DateTime?
  revokedAt   DateTime?
  
  workspace   Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  
  @@unique([workspaceId, email])
  @@map("workspace_invites")
  @@index([workspaceId])
  @@index([token])
  @@index([expiresAt])
}
```

### 3.4 Modelos Enterprise (Opcional para Franquias)

```prisma
// ENTERPRISE — Empresa/Loja/Unidade
model Enterprise {
  id          String   @id @default(cuid())
  workspaceId String
  
  // Identificação
  type        EnterpriseType
  legalName   String?
  tradeName   String
  document    String?  @unique
  documentType EnterpriseDocumentType @default(NONE)
  
  // Segmentação
  segment     String   // Delivery, Restaurante, etc
  subSegment  String?
  
  // Status
  isMain      Boolean  @default(false)
  isActive    Boolean  @default(true)
  
  // Endereço
  address     Json?    // { street, number, city, state, zip }
  contact     Json     // { phone, email, website }
  
  // Relacionamentos
  workspace         Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  workspaceAsMother Workspace? @relation("EnterpriseMother")
  themes            ThemeUI[]
  componentLayouts  ComponentLayout[]
  meiProfiles       MeiProfile[]
  
  createdById String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@map("enterprises")
  @@index([workspaceId])
  @@index([document])
  @@index([type])
  @@index([isMain])
  @@index([isActive])
}

enum EnterpriseType {
  AUTONOMO   // Pessoa física
  EMPRESA    // Pessoa jurídica
}

enum EnterpriseDocumentType {
  CPF
  CNPJ
  NONE
}
```

### 3.5 Modelos Billing (ISOLADO)

```prisma
// SUBSCRIPTION — Assinatura (isolado de Workspace)
model Subscription {
  id            String   @id @default(cuid())
  workspaceId   String   @unique
  
  planId        String
  plan          Plan     @relation(fields: [planId], references: [id])
  
  // Status
  status        SubscriptionStatus @default(ACTIVE)
  
  // Período
  currentPeriodStart DateTime
  currentPeriodEnd   DateTime
  
  // Stripe (isolado aqui)
  stripeCustomerId     String? @unique
  stripeSubscriptionId String? @unique
  stripePriceId        String?
  
  workspace     Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@map("subscriptions")
  @@index([workspaceId])
  @@index([status])
  @@index([planId])
}

enum SubscriptionStatus {
  ACTIVE
  CANCELED
  PAST_DUE
  UNPAID
  TRIALING
}

// PLAN — Plano de assinatura
model Plan {
  id          String   @id @default(cuid())
  code        String   @unique
  name        String
  description String?
  
  // Preço
  price       Decimal  @db.Decimal(15, 2)
  currency    String   @default("BRL")
  billingCycle BillingCycle
  
  // Stripe
  stripePriceId String? @unique
  
  // Features incluídas (JSON array)
  features    Json     @default("[]")
  
  // Limites
  limits      Json     @default("{}")
  
  // Status
  isActive    Boolean  @default(true)
  isPublic    Boolean  @default(true)
  
  subscriptions Subscription[]
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@map("plans")
  @@index([code])
  @@index([isActive])
}

enum BillingCycle {
  MONTHLY
  YEARLY
  LIFETIME
}
```

### 3.6 Modelos Wallet & Features

```prisma
// WALLET — Economia interna
model Wallet {
  id              String   @id @default(cuid())
  workspaceId     String   @unique
  
  balance         Decimal  @default(0) @db.Decimal(15, 2)
  reservedBalance Decimal  @default(0) @db.Decimal(15, 2)
  currency        String   @default("COIN")
  
  workspace       Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  transactions    WalletTransaction[]
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@map("wallets")
  @@index([workspaceId])
}

model WalletTransaction {
  id          String   @id @default(cuid())
  walletId    String
  
  type        WalletTransactionType
  amount      Decimal  @db.Decimal(15, 2)
  description String
  
  // Referência do que gerou
  referenceType String?
  referenceId   String?
  
  wallet      Wallet   @relation(fields: [walletId], references: [id], onDelete: Cascade)
  
  createdAt DateTime @default(now())
  
  @@map("wallet_transactions")
  @@index([walletId])
  @@index([type])
  @@index([createdAt])
}

enum WalletTransactionType {
  ONBOARDING_BONUS      // Bônus de onboarding
  PLAN_REWARD            // Reward do plano
  PROMOTION              // Promoção
  EXTENSION_PURCHASE     // Compra de extensão
  AI_CONSUMPTION         // Consumo de IA
  MANUAL_CREDIT          // Crédito manual
  MANUAL_DEBIT           // Débito manual
}

// FEATURE — Catálogo de features
model Feature {
  id          String   @id @default(cuid())
  code        String   @unique
  name        String
  category    FeatureCategory
  description String?
  
  // Plano mínimo requerido
  requiresPlan WorkspacePlan? @default(null)
  
  // Status
  isActive    Boolean  @default(true)
  isPublic    Boolean  @default(false)
  
  // Metadata
  icon        String?
  version     String   @default("1.0.0")
  
  workspaceFeatures WorkspaceFeature[]
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@map("features")
  @@index([code])
  @@index([category])
  @@index([isActive])
}

enum FeatureCategory {
  CORE        // Core do sistema
  AI          // Inteligência artificial
  AUTOMATION  // Automações
  UI          // Componentes de UI
  INTEGRATION // Integrações
}

enum WorkspacePlan {
  FREE
  PRO
  ENTERPRISE
}

// WORKSPACE FEATURE — Estado da feature
model WorkspaceFeature {
  id          String   @id @default(cuid())
  workspaceId String
  featureId   String
  
  source      FeatureSource
  enabled     Boolean  @default(true)
  enabledAt   DateTime?
  expiresAt   DateTime?    // Para trials
  
  // Configuração específica
  config      Json     @default("{}")
  
  workspace   Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  feature     Feature   @relation(fields: [featureId], references: [id], onDelete: Cascade)
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@unique([workspaceId, featureId])
  @@map("workspace_features")
  @@index([workspaceId])
  @@index([enabled])
  @@index([expiresAt])
}

enum FeatureSource {
  PLAN        // Incluída no plano
  STORE       // Comprada na loja
  PROMOTION   // Promoção/trial
  ONBOARDING  // Ganha no onboarding
}
```

### 3.7 Modelos Theme & UI

```prisma
// THEME UI — Design por workspace/enterprise
model ThemeUI {
  id                String   @id @default(cuid())
  workspaceId       String
  enterpriseMotherId String
  
  themeType         ThemeUIType
  themeName         String
  
  // Design tokens (JSON)
  colors            Json     // { primary, secondary, accent, neutral }
  typography        Json     // { fontFamily, fontSizes, lineHeights }
  layout            Json     // { spacing, borderRadius, shadows }
  
  darkModeEnabled   Boolean  @default(false)
  
  workspace         Workspace  @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  enterprise        Enterprise @relation(fields: [enterpriseMotherId], references: [id], onDelete: Cascade)
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@unique([workspaceId, enterpriseMotherId])
  @@map("theme_ui")
  @@index([workspaceId])
  @@index([enterpriseMotherId])
}

enum ThemeUIType {
  SYSTEM     // Tema padrão
  TEMPLATE   // Tema de template
  CUSTOM     // Customizado pelo usuário
}

// THEME PRESET — Presets reutilizáveis
model ThemePreset {
  id          String   @id @default(cuid())
  code        String   @unique
  name        String
  description String?
  
  // Categoria (qual nicho)
  category    WorkspaceCategory?
  
  // Tema
  themeType   ThemeUIType
  
  // Design tokens
  colors      Json
  typography  Json
  layout      Json
  
  // Status
  isActive    Boolean  @default(true)
  isPublic    Boolean  @default(true)
  isPremium   Boolean  @default(false)
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@map("theme_presets")
  @@index([code])
  @@index([category])
  @@index([isActive])
}

// COMPONENT LAYOUT — UI customizada por workspace/enterprise
model ComponentLayout {
  id                String   @id @default(cuid())
  workspaceId       String
  enterpriseMotherId String
  
  layoutVersion     Int      @default(1)
  
  // Componentes configurados (JSON array)
  components        Json     // UIComponentConfig[]
  
  workspace         Workspace  @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  enterprise        Enterprise @relation(fields: [enterpriseMotherId], references: [id], onDelete: Cascade)
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@unique([workspaceId, enterpriseMotherId])
  @@map("component_layouts")
  @@index([workspaceId])
  @@index([enterpriseMotherId])
}
```

### 3.8 Modelos Negócio (Sales)

```prisma
// CUSTOMER — Cliente
model Customer {
  id          String   @id @default(cuid())
  workspaceId String
  
  name        String
  email       String?
  phone       String?
  document    String?
  
  // Endereço
  address     Json?
  
  // Status
  isActive    Boolean  @default(true)
  
  workspace   Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  orders      Order[]
  quotes      Quote[]
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@map("customers")
  @@index([workspaceId])
  @@index([email])
  @@index([document])
}

// PRODUCT — Produto
model Product {
  id          String   @id @default(cuid())
  workspaceId String
  categoryId  String?
  
  name        String
  description String?
  sku         String?  @unique
  
  price       Decimal  @db.Decimal(15, 2)
  cost        Decimal? @db.Decimal(15, 2)
  
  // Stock
  quantity    Int      @default(0)
  
  // Status
  isActive    Boolean  @default(true)
  
  workspace   Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  category    ProductCategory? @relation(fields: [categoryId], references: [id], onDelete: SetNull)
  orderItems  OrderItem[]
  quoteItems  QuoteItem[]
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@map("products")
  @@index([workspaceId])
  @@index([categoryId])
  @@index([sku])
  @@index([isActive])
}

// PRODUCT CATEGORY — Categoria
model ProductCategory {
  id          String   @id @default(cuid())
  workspaceId String
  
  name        String
  description String?
  isActive    Boolean  @default(true)
  
  workspace   Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  products    Product[]
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@map("product_categories")
  @@index([workspaceId])
}

// QUOTE — Orçamento
model Quote {
  id          String   @id @default(cuid())
  workspaceId String
  customerId  String?
  
  quoteNumber String   @unique
  total       Decimal  @db.Decimal(15, 2)
  
  // Conversão
  convertedToOrderId String? @unique
  status      QuoteStatus @default(PENDING)
  
  items       QuoteItem[]
  customer    Customer? @relation(fields: [customerId], references: [id], onDelete: SetNull)
  order       Order?    @relation(fields: [convertedToOrderId], references: [id], onDelete: SetNull)
  workspace   Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@map("quotes")
  @@index([workspaceId])
  @@index([customerId])
  @@index([status])
}

enum QuoteStatus {
  PENDING
  APPROVED
  REJECTED
  CONVERTED
  EXPIRED
}

// QUOTE ITEM — Item do orçamento
model QuoteItem {
  id        String   @id @default(cuid())
  quoteId   String
  productId String
  
  quantity  Int
  unitPrice Decimal  @db.Decimal(15, 2)
  subtotal  Decimal  @db.Decimal(15, 2)
  
  quote     Quote    @relation(fields: [quoteId], references: [id], onDelete: Cascade)
  product   Product  @relation(fields: [productId], references: [id])
  
  @@map("quote_items")
  @@index([quoteId])
  @@index([productId])
}

// ORDER — Pedido de venda
model Order {
  id          String   @id @default(cuid())
  workspaceId String
  customerId  String?
  quoteId     String?  @unique
  
  orderNumber String   @unique
  total       Decimal  @db.Decimal(15, 2)
  
  status      OrderStatus @default(PENDING)
  paidAt      DateTime?
  
  items       OrderItem[]
  invoice     Invoice?
  customer    Customer? @relation(fields: [customerId], references: [id], onDelete: SetNull)
  quote       Quote?    @relation(fields: [quoteId], references: [id], onDelete: SetNull)
  workspace   Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@map("orders")
  @@index([workspaceId])
  @@index([customerId])
  @@index([status])
}

enum OrderStatus {
  PENDING
  CONFIRMED
  PROCESSING
  SHIPPED
  DELIVERED
  CANCELED
  COMPLETED
}

// ORDER ITEM
model OrderItem {
  id        String   @id @default(cuid())
  orderId   String
  productId String
  
  quantity  Int
  unitPrice Decimal  @db.Decimal(15, 2)
  subtotal  Decimal  @db.Decimal(15, 2)
  
  order     Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  product   Product  @relation(fields: [productId], references: [id])
  
  @@map("order_items")
  @@index([orderId])
  @@index([productId])
}
```

### 3.9 Modelos Financeiro

```prisma
// INVOICE — Fatura/Nota Fiscal
model Invoice {
  id          String   @id @default(cuid())
  workspaceId String
  orderId     String?  @unique
  
  invoiceNumber String @unique
  total         Decimal @db.Decimal(15, 2)
  
  issueDate   DateTime
  dueDate     DateTime
  paidAt      DateTime?
  status      InvoiceStatus @default(ISSUED)
  
  // Fatura eletrônica (futuro)
  nfeNumber   String?
  nfeLink     String?
  
  items       InvoiceItem[]
  order       Order?     @relation(fields: [orderId], references: [id], onDelete: SetNull)
  workspace   Workspace  @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  transactions Transaction[] @relation("InvoiceTransactions")
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@map("invoices")
  @@index([workspaceId])
  @@index([status])
  @@index([dueDate])
}

enum InvoiceStatus {
  ISSUED
  SENT
  VIEWED
  PARTIALLY_PAID
  PAID
  OVERDUE
  CANCELED
}

// INVOICE ITEM
model InvoiceItem {
  id        String   @id @default(cuid())
  invoiceId String
  
  description String
  quantity    Int
  unitPrice   Decimal  @db.Decimal(15, 2)
  subtotal    Decimal  @db.Decimal(15, 2)
  
  invoice     Invoice  @relation(fields: [invoiceId], references: [id], onDelete: Cascade)
  
  @@map("invoice_items")
  @@index([invoiceId])
}

// TRANSACTION — Transação financeira
model Transaction {
  id          String   @id @default(cuid())
  workspaceId String
  invoiceId   String?
  
  type        TransactionType
  amount      Decimal  @db.Decimal(15, 2)
  description String?
  
  // Referência
  referenceType String?
  referenceId   String?
  
  // Status
  status      TransactionStatus @default(PENDING)
  
  workspace   Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  invoices    Invoice[] @relation("InvoiceTransactions")
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@map("transactions")
  @@index([workspaceId])
  @@index([type])
  @@index([status])
  @@index([createdAt])
}

enum TransactionType {
  INCOME
  EXPENSE
  TRANSFER
  ADJUSTMENT
}

enum TransactionStatus {
  PENDING
  COMPLETED
  FAILED
  CANCELED
}

// BANK ACCOUNT
model BankAccount {
  id          String   @id @default(cuid())
  workspaceId String
  
  accountName String
  accountNumber String @unique
  accountDigit String?
  bankCode    String
  bankName    String
  accountType BankAccountType
  
  isActive    Boolean  @default(true)
  
  workspace   Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  transactions BankTransaction[]
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@map("bank_accounts")
  @@index([workspaceId])
  @@index([accountNumber])
}

enum BankAccountType {
  CHECKING
  SAVINGS
  DIGITAL
}

// BANK TRANSACTION — Transação importada do banco
model BankTransaction {
  id            String   @id @default(cuid())
  workspaceId   String
  bankAccountId String
  
  date          DateTime
  description   String
  amount        Decimal  @db.Decimal(15, 2)
  
  // Status de conciliação
  isReconciled  Boolean  @default(false)
  matchedTransactionId String?
  
  workspace     Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  bankAccount   BankAccount @relation(fields: [bankAccountId], references: [id], onDelete: Cascade)
  
  createdAt DateTime @default(now())
  
  @@map("bank_transactions")
  @@index([workspaceId])
  @@index([bankAccountId])
  @@index([isReconciled])
}
```

### 3.10 Modelos Pagamentos

```prisma
// PIX PAYMENT — Pagamento via PIX
model PixPayment {
  id          String   @id @default(cuid())
  workspaceId String
  
  amount      Decimal  @db.Decimal(15, 2)
  qrCode      String?
  qrCodeUrl   String?
  
  // Referência
  referenceType String? // INVOICE, QUOTE, ORDER
  referenceId   String?
  
  status      PixPaymentStatus @default(PENDING)
  paidAt      DateTime?
  
  workspace   Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@map("pix_payments")
  @@index([workspaceId])
  @@index([status])
}

enum PixPaymentStatus {
  PENDING
  PAID
  EXPIRED
  FAILED
}

// PIX KEY — Chave PIX cadastrada
model PixKey {
  id          String   @id @default(cuid())
  workspaceId String
  
  key         String   @unique
  keyType     PixKeyType
  holder      String
  document    String?
  
  isActive    Boolean  @default(true)
  
  workspace   Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@map("pix_keys")
  @@index([workspaceId])
  @@index([key])
}

enum PixKeyType {
  RANDOM
  EMAIL
  PHONE
  DOCUMENT
}

// DAS PAYMENT — Pagamento DAS (para MEI)
model DasPayment {
  id          String   @id @default(cuid())
  workspaceId String
  
  competence  DateTime // Mês/ano de competência
  amount      Decimal  @db.Decimal(15, 2)
  
  paidAt      DateTime?
  status      DasPaymentStatus @default(PENDING)
  
  workspace   Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@map("das_payments")
  @@index([workspaceId])
  @@index([competence])
  @@index([status])
}

enum DasPaymentStatus {
  PENDING
  PAID
  OVERDUE
  CANCELED
}

// PAYMENT LINK — Link de pagamento compartilhável
model PaymentLink {
  id          String   @id @default(cuid())
  workspaceId String
  
  token       String   @unique
  amount      Decimal  @db.Decimal(15, 2)
  description String?
  
  // Referência
  referenceType String?
  referenceId   String?
  
  status      PaymentLinkStatus @default(ACTIVE)
  expiresAt   DateTime?
  paidAt      DateTime?
  
  workspace   Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@map("payment_links")
  @@index([workspaceId])
  @@index([token])
  @@index([status])
}

enum PaymentLinkStatus {
  ACTIVE
  PAID
  EXPIRED
  CANCELED
}

// SPLIT RULE — Regra de divisão de pagamentos
model SplitRule {
  id          String   @id @default(cuid())
  workspaceId String
  
  name        String
  description String?
  
  // Configuração de divisão (JSON)
  rules       Json     // { recipientId, percentage ou amount }
  
  isActive    Boolean  @default(true)
  
  workspace   Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  allocations SplitAllocation[]
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@map("split_rules")
  @@index([workspaceId])
}

// SPLIT ALLOCATION — Alocação de divisão
model SplitAllocation {
  id          String   @id @default(cuid())
  splitRuleId String
  
  recipientId String?  // Quem recebe
  
  type        SplitAllocationType // PERCENTAGE ou AMOUNT
  value       Decimal  @db.Decimal(15, 2)
  
  splitRule   SplitRule @relation(fields: [splitRuleId], references: [id], onDelete: Cascade)
  
  @@map("split_allocations")
  @@index([splitRuleId])
}

enum SplitAllocationType {
  PERCENTAGE
  AMOUNT
}

// VIRTUAL ACCOUNT — Conta virtual para recebimentos
model VirtualAccount {
  id          String   @id @default(cuid())
  workspaceId String
  
  accountId   String   @unique
  accountNumber String @unique
  bankCode    String
  bankName    String
  
  status      VirtualAccountStatus @default(ACTIVE)
  metadata    Json?
  
  workspace   Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@map("virtual_accounts")
  @@index([workspaceId])
  @@index([accountId])
  @@index([status])
}

enum VirtualAccountStatus {
  ACTIVE
  INACTIVE
  SUSPENDED
}
```

### 3.11 Modelos Sistema

```prisma
// MEI PROFILE — Perfil do MEI
model MeiProfile {
  id          String   @id @default(cuid())
  workspaceId String
  enterpriseId String
  
  cnpj        String   @unique
  name        String
  email       String?
  phone       String?
  
  mainActivity String
  activities  String[]
  
  isActive    Boolean  @default(true)
  
  workspace   Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  enterprise  Enterprise @relation(fields: [enterpriseId], references: [id], onDelete: Cascade)
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@map("mei_profiles")
  @@index([workspaceId])
  @@index([cnpj])
}

// MODULE — Módulo do sistema
model Module {
  id          String   @id @default(cuid())
  code        String   @unique
  name        String
  description String?
  
  isActive    Boolean  @default(true)
  isCore      Boolean  @default(false)
  
  configs     ModuleConfig[]
  permissions ModulePermission[]
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@map("modules")
  @@index([code])
  @@index([isActive])
}

// MODULE CONFIG — Configuração por módulo/workspace
model ModuleConfig {
  id          String   @id @default(cuid())
  workspaceId String
  moduleId    String
  
  // Configuração específica (JSON)
  config      Json     @default("{}")
  isEnabled   Boolean  @default(true)
  
  workspace   Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  module      Module    @relation(fields: [moduleId], references: [id], onDelete: Cascade)
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@unique([workspaceId, moduleId])
  @@map("module_configs")
  @@index([workspaceId])
}

// MODULE PERMISSION — Permissão por módulo/role
model ModulePermission {
  id          String   @id @default(cuid())
  moduleId    String
  roleId      String?
  
  permission  String
  action      String    // READ, CREATE, UPDATE, DELETE
  
  module      Module @relation(fields: [moduleId], references: [id], onDelete: Cascade)
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@map("module_permissions")
  @@index([moduleId])
}

// ROLE PERMISSION — Permissão por role
model RolePermission {
  id          String   @id @default(cuid())
  
  role        WorkspaceRole
  resource    String
  action      String   // READ, CREATE, UPDATE, DELETE
  
  @@unique([role, resource, action])
  @@map("role_permissions")
  @@index([role])
}

// AUDIT LOG — Log de auditoria
model AuditLog {
  id          String   @id @default(cuid())
  workspaceId String
  userId      String?
  
  action      String   // CREATE, UPDATE, DELETE, EXPORT
  resource    String   // USER, ORDER, INVOICE, etc
  resourceId  String?
  
  changes     Json?    // Campo anterior e novo
  ip          String?
  userAgent   String?
  
  workspace   Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  
  createdAt DateTime @default(now())
  
  @@map("audit_logs")
  @@index([workspaceId])
  @@index([userId])
  @@index([resource])
  @@index([createdAt])
}

// MESSAGE TEMPLATE — Templates de mensagens
model MessageTemplate {
  id          String   @id @default(cuid())
  workspaceId String
  
  name        String
  code        String
  type        MessageTemplateType
  
  subject     String?
  body        String   // Pode ter variáveis {{var}}
  channels    String[] // EMAIL, SMS, WHATSAPP
  
  isActive    Boolean  @default(true)
  
  workspace   Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@unique([workspaceId, code])
  @@map("message_templates")
  @@index([workspaceId])
  @@index([code])
}

enum MessageTemplateType {
  EMAIL
  SMS
  WHATSAPP
  NOTIFICATION
  INVOICE
  ORDER
  QUOTE
}

// AVISO — Notificações do sistema
model Aviso {
  id          String   @id @default(cuid())
  workspaceId String?  // Null = aviso global
  userId      String?  // Null = aviso para todo workspace
  
  title       String
  message     String
  type        AvisoType @default(INFO)
  
  actionLabel String?
  actionUrl   String?
  
  isRead      Boolean  @default(false)
  readAt      DateTime?
  expiresAt   DateTime?
  
  workspace   Workspace? @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  user        User?      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@map("avisos")
  @@index([workspaceId])
  @@index([userId])
  @@index([isRead])
  @@index([expiresAt])
}

enum AvisoType {
  INFO
  SUCCESS
  WARNING
  ERROR
}

// DUNNING POLICY — Política de cobrança
model DunningPolicy {
  id          String   @id @default(cuid())
  workspaceId String
  
  name        String
  description String?
  
  // Tentativas de cobrança
  retries     Json     // Array de { daysAfterDue, channel, template }
  
  isActive    Boolean  @default(true)
  
  workspace   Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  jobs        DunningJob[]
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@map("dunning_policies")
  @@index([workspaceId])
}

// DUNNING JOB — Job de cobrança agendado
model DunningJob {
  id          String   @id @default(cuid())
  workspaceId String
  policyId    String
  
  invoiceId   String?
  
  status      DunningJobStatus @default(PENDING)
  scheduledFor DateTime
  executedAt  DateTime?
  
  workspace   Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  policy      DunningPolicy @relation(fields: [policyId], references: [id], onDelete: Cascade)
  logs        DunningLog[]
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@map("dunning_jobs")
  @@index([workspaceId])
  @@index([status])
  @@index([scheduledFor])
}

enum DunningJobStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
}

// DUNNING LOG — Log de tentativa de cobrança
model DunningLog {
  id          String   @id @default(cuid())
  workspaceId String
  jobId       String
  
  channel     String   // EMAIL, SMS, WHATSAPP
  sentAt      DateTime
  status      String   // SENT, FAILED, BOUNCED
  
  workspace   Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  job         DunningJob @relation(fields: [jobId], references: [id], onDelete: Cascade)
  
  createdAt DateTime @default(now())
  
  @@map("dunning_logs")
  @@index([workspaceId])
  @@index([jobId])
}

// ANALYTICS EVENT — Evento de tracking
model AnalyticsEvent {
  id          String   @id @default(cuid())
  workspaceId String
  userId      String?
  
  eventType   String
  entityType  String?
  entityId    String?
  
  properties  Json     @default("{}")
  
  workspace   Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  
  createdAt DateTime @default(now())
  
  @@map("analytics_events")
  @@index([workspaceId])
  @@index([eventType])
  @@index([createdAt])
}

// ANALYTICS METRIC — Métrica agregada
model AnalyticsMetric {
  id          String   @id @default(cuid())
  workspaceId String
  
  metricType  String
  period      String   // day, week, month
  periodDate  DateTime
  
  value       Decimal  @db.Decimal(15, 2)
  metadata    Json?
  
  workspace   Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  
  createdAt DateTime @default(now())
  
  @@unique([workspaceId, metricType, period, periodDate])
  @@map("analytics_metrics")
  @@index([workspaceId])
  @@index([metricType])
  @@index([periodDate])
}

// ONBOARDING FLOW — Fluxo de onboarding
model OnboardingFlow {
  id          String   @id @default(cuid())
  code        String   @unique
  name        String
  description String?
  
  steps       Json     // Array de steps
  isActive    Boolean  @default(true)
  
  completions OnboardingCompletion[]
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@map("onboarding_flows")
  @@index([code])
}

// ONBOARDING COMPLETION — Progresso do onboarding
model OnboardingCompletion {
  id          String   @id @default(cuid())
  workspaceId String   @unique
  flowId      String
  
  currentStep Int      @default(0)
  completedSteps Json  @default("[]")
  
  isCompleted Boolean  @default(false)
  completedAt DateTime?
  
  workspace   Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  flow        OnboardingFlow @relation(fields: [flowId], references: [id])
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@map("onboarding_completions")
  @@index([workspaceId])
  @@index([isCompleted])
}

// PIPELINE EVENT — Evento de pipeline/automação
model PipelineEvent {
  id          String   @id @default(cuid())
  workspaceId String
  
  eventType   String
  status      String   // PENDING, PROCESSING, COMPLETED, FAILED
  
  data        Json
  
  workspace   Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@map("pipeline_events")
  @@index([workspaceId])
  @@index([eventType])
  @@index([status])
}

// GLOBAL USER — Usuários com acesso global (cross-workspace)
model GlobalUser {
  id          String   @id @default(cuid())
  userId      String   @unique
  
  role        GlobalUserRole
  isActive    Boolean  @default(true)
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@map("global_users")
  @@index([userId])
  @@index([role])
}

enum GlobalUserRole {
  ADMIN
  SUPPORT
  BILLING
}

// USER DASHBOARD SETTINGS — Configurações de dashboard por usuário
model UserDashboardSettings {
  id          String   @id @default(cuid())
  userId      String   @unique
  workspaceId String
  
  layout      Json     // Layout customizado
  widgets     Json     // Widgets visíveis
  theme       String   @default("light")
  
  workspace   Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@map("user_dashboard_settings")
  @@index([userId])
  @@index([workspaceId])
}

// FEATURE FLAG OVERRIDE — Override de feature flags
model FeatureFlagOverride {
  id          String   @id @default(cuid())
  workspaceId String?  // Null = global
  
  flag        String
  value       Boolean
  
  @@unique([workspaceId, flag])
  @@map("feature_flag_overrides")
  @@index([workspaceId])
  @@index([flag])
}
```

---

## 4. ESTRUTURA DE PASTAS (DDD + Next.js)

```
seumei/
│
├── /src                                  # Código-fonte
│   │
│   ├── /app                              # Next.js App Router
│   │   │
│   │   ├── (auth)/                       # Route group: Autenticação
│   │   │   ├── login/
│   │   │   │   ├── page.tsx
│   │   │   │   └── login-form.tsx
│   │   │   ├── register/
│   │   │   │   ├── page.tsx
│   │   │   │   └── register-form.tsx
│   │   │   ├── forgot-password/
│   │   │   ├── verify-email/
│   │   │   └── layout.tsx
│   │   │
│   │   ├── (dashboard)/                  # Route group: Dashboard protegido
│   │   │   │
│   │   │   ├── [workspace]/              # Dynamic route: workspace scoped
│   │   │   │   │
│   │   │   │   ├── page.tsx              # Dashboard home
│   │   │   │   │
│   │   │   │   ├── dashboard/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   ├── mei-dashboard/    # Dashboard específico MEI
│   │   │   │   │   ├── components/       # Components do dashboard
│   │   │   │   │   │   ├── accounts-section.tsx
│   │   │   │   │   │   ├── billing-section.tsx
│   │   │   │   │   │   ├── cashflow-section.tsx
│   │   │   │   │   │   └── ...
│   │   │   │   │   └── reports/
│   │   │   │   │
│   │   │   │   ├── customers/            # Gestão de clientes
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   ├── [id]/
│   │   │   │   │   ├── new/
│   │   │   │   │   ├── customers-table.tsx
│   │   │   │   │   └── customer-form.tsx
│   │   │   │   │
│   │   │   │   ├── products/             # Gestão de produtos
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   ├── [id]/
│   │   │   │   │   ├── new/
│   │   │   │   │   ├── categories/
│   │   │   │   │   ├── products-table.tsx
│   │   │   │   │   └── product-form.tsx
│   │   │   │   │
│   │   │   │   ├── orders/               # Gestão de pedidos
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   ├── [id]/
│   │   │   │   │   ├── new/
│   │   │   │   │   ├── orders-list.tsx
│   │   │   │   │   └── order-form.tsx
│   │   │   │   │
│   │   │   │   ├── quotes/               # Gestão de orçamentos
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   ├── [id]/
│   │   │   │   │   ├── new/
│   │   │   │   │   ├── quotes-list.tsx
│   │   │   │   │   └── quote-form.tsx
│   │   │   │   │
│   │   │   │   ├── invoices/             # Gestão de faturas
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   ├── [id]/
│   │   │   │   │   ├── new/
│   │   │   │   │   ├── invoices-table.tsx
│   │   │   │   │   └── invoice-form.tsx
│   │   │   │   │
│   │   │   │   ├── finance/              # Gestão financeira
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   ├── accounts/
│   │   │   │   │   ├── transactions/
│   │   │   │   │   └── reports/
│   │   │   │   │
│   │   │   │   ├── payments/             # Pagamentos
│   │   │   │   │   ├── pix/
│   │   │   │   │   ├── das/
│   │   │   │   │   ├── payment-links/
│   │   │   │   │   └── page.tsx
│   │   │   │   │
│   │   │   │   ├── avisos/               # Notificações
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── avisos-list.tsx
│   │   │   │   │
│   │   │   │   ├── settings/             # Configurações
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   ├── general/
│   │   │   │   │   ├── billing/
│   │   │   │   │   ├── team/
│   │   │   │   │   ├── security/
│   │   │   │   │   ├── appearance/
│   │   │   │   │   ├── modules/
│   │   │   │   │   ├── notifications/
│   │   │   │   │   └── audit/
│   │   │   │   │
│   │   │   │   └── layout.tsx            # Layout do dashboard (shell)
│   │   │   │
│   │   │   └── layout.tsx                # Layout protegido
│   │   │
│   │   ├── (marketing)/                  # Route group: Marketing/Public
│   │   │   ├── page.tsx                  # Home/Landing
│   │   │   ├── pricing/
│   │   │   ├── features/
│   │   │   ├── help/
│   │   │   └── layout.tsx
│   │   │
│   │   ├── api/                          # API Routes
│   │   │   │
│   │   │   ├── auth/                     # Auth APIs
│   │   │   │   ├── login/route.ts
│   │   │   │   ├── register/route.ts
│   │   │   │   ├── logout/route.ts
│   │   │   │   └── session/route.ts
│   │   │   │
│   │   │   ├── v1/                       # API v1
│   │   │   │   │
│   │   │   │   ├── workspaces/
│   │   │   │   │   ├── route.ts          # GET (list), POST (create)
│   │   │   │   │   └── [id]/
│   │   │   │   │       ├── route.ts      # GET, PATCH, DELETE
│   │   │   │   │       ├── settings/
│   │   │   │   │       └── members/
│   │   │   │   │
│   │   │   │   ├── customers/
│   │   │   │   │   ├── route.ts
│   │   │   │   │   └── [id]/route.ts
│   │   │   │   │
│   │   │   │   ├── products/
│   │   │   │   │   ├── route.ts
│   │   │   │   │   └── [id]/route.ts
│   │   │   │   │
│   │   │   │   ├── orders/
│   │   │   │   │   ├── route.ts
│   │   │   │   │   └── [id]/route.ts
│   │   │   │   │
│   │   │   │   ├── invoices/
│   │   │   │   │   ├── route.ts
│   │   │   │   │   └── [id]/route.ts
│   │   │   │   │
│   │   │   │   ├── transactions/
│   │   │   │   │   ├── route.ts
│   │   │   │   │   └── [id]/route.ts
│   │   │   │   │
│   │   │   │   ├── payments/
│   │   │   │   │   ├── pix/route.ts
│   │   │   │   │   └── das/route.ts
│   │   │   │   │
│   │   │   │   └── features/
│   │   │   │       ├── route.ts
│   │   │   │       └── [id]/route.ts
│   │   │   │
│   │   │   ├── webhooks/                 # Webhooks
│   │   │   │   ├── stripe/route.ts
│   │   │   │   └── pix/route.ts
│   │   │   │
│   │   │   └── health/route.ts           # Health check
│   │   │
│   │   ├── layout.tsx                    # Root layout
│   │   ├── page.tsx                      # Home
│   │   ├── robots.txt
│   │   └── sitemap.ts
│   │
│   ├── /domains                          # DDD: Lógica de negócio
│   │   │
│   │   ├── /auth
│   │   │   ├── models/
│   │   │   │   └── auth.ts
│   │   │   ├── services/
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── password.service.ts
│   │   │   │   └── session.service.ts
│   │   │   ├── repositories/
│   │   │   ├── actions/
│   │   │   │   └── auth.actions.ts
│   │   │   ├── types.ts
│   │   │   ├── server.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── /user
│   │   │   ├── models/
│   │   │   ├── services/
│   │   │   ├── types.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── /workspace                    # CORE: Container principal
│   │   │   ├── models/
│   │   │   ├── services/
│   │   │   │   ├── workspace.service.ts
│   │   │   │   ├── limits.service.ts
│   │   │   │   └── subscription.service.ts
│   │   │   ├── repositories/
│   │   │   ├── actions/
│   │   │   │   ├── workspace.actions.ts
│   │   │   │   └── invites.actions.ts
│   │   │   ├── db/
│   │   │   │   └── schemas/
│   │   │   ├── types.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── /enterprise
│   │   │   ├── models/
│   │   │   ├── services/
│   │   │   ├── types.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── /billing (⚠️ ISOLADO)
│   │   │   ├── models/
│   │   │   ├── services/
│   │   │   │   ├── billing.service.ts    ← Abstração principal
│   │   │   │   └── plan.service.ts
│   │   │   ├── stripe/                   ← Gateway isolado
│   │   │   │   ├── client.ts
│   │   │   │   ├── webhooks.ts
│   │   │   │   └── service.ts
│   │   │   ├── types.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── /wallet
│   │   │   ├── models/
│   │   │   ├── services/
│   │   │   │   └── wallet.service.ts
│   │   │   ├── types.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── /features
│   │   │   ├── models/
│   │   │   ├── services/
│   │   │   │   ├── features.service.ts
│   │   │   │   └── store.service.ts     ← Marketplace
│   │   │   ├── store/                    ← Logic de compra/ativação
│   │   │   │   ├── activation.ts
│   │   │   │   └── pricing.ts
│   │   │   ├── types.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── /theme-ui
│   │   │   ├── models/
│   │   │   ├── services/
│   │   │   │   ├── theme.service.ts
│   │   │   │   └── color-generator.ts
│   │   │   ├── utils/
│   │   │   ├── types.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── /templates
│   │   │   ├── /theme
│   │   │   ├── /onboarding
│   │   │   ├── /message
│   │   │   └── index.ts
│   │   │
│   │   ├── /onboarding
│   │   │   ├── models/
│   │   │   ├── services/
│   │   │   │   └── onboarding.service.ts
│   │   │   ├── flows/                    ← Fluxos de onboarding
│   │   │   ├── types.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── /permissions
│   │   │   ├── models/
│   │   │   ├── services/
│   │   │   │   ├── permissions.service.ts
│   │   │   │   └── rbac.service.ts      ← Role-based access control
│   │   │   ├── policies/
│   │   │   ├── types.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── /analytics
│   │   │   ├── models/
│   │   │   ├── services/
│   │   │   │   ├── analytics.service.ts
│   │   │   │   └── reporting.service.ts
│   │   │   ├── types.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── /audit
│   │   │   ├── models/
│   │   │   ├── services/
│   │   │   │   └── audit.service.ts
│   │   │   ├── types.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── /sales
│   │   │   ├── models/
│   │   │   ├── services/
│   │   │   │   ├── order.service.ts
│   │   │   │   └── quote.service.ts
│   │   │   ├── types.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── /products
│   │   │   ├── models/
│   │   │   ├── services/
│   │   │   │   └── products.service.ts
│   │   │   ├── types.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── /finance
│   │   │   ├── models/
│   │   │   ├── services/
│   │   │   │   ├── invoice.service.ts
│   │   │   │   ├── transaction.service.ts
│   │   │   │   └── reconciliation.service.ts
│   │   │   ├── types.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── /payments
│   │   │   ├── models/
│   │   │   ├── services/
│   │   │   │   ├── pix.service.ts
│   │   │   │   ├── das.service.ts
│   │   │   │   └── split.service.ts
│   │   │   ├── types.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── /system
│   │   │   ├── models/
│   │   │   ├── services/
│   │   │   │   ├── module.service.ts
│   │   │   │   ├── dunning.service.ts
│   │   │   │   └── notification.service.ts
│   │   │   ├── types.ts
│   │   │   └── index.ts
│   │   │
│   │   └── /shared                       ← Tipos e utilitários comuns
│   │       ├── db/
│   │       │   ├── client.ts
│   │       │   ├── logger.ts
│   │       │   └── types.ts
│   │       ├── types/
│   │       │   ├── index.ts
│   │       │   ├── common.ts
│   │       │   └── validation.ts
│   │       ├── utils/
│   │       │   ├── validation.ts
│   │       │   ├── errors.ts
│   │       │   └── formatters.ts
│   │       └── constants/
│   │           └── index.ts
│   │
│   ├── /components                       # Componentes React
│   │   │
│   │   ├── /ui                           # Componentes base (shadcn)
│   │   │   ├── button.tsx
│   │   │   ├── form.tsx
│   │   │   ├── table.tsx
│   │   │   ├── dialog.tsx
│   │   │   └── ...
│   │   │
│   │   ├── /layout
│   │   │   ├── MainNav.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── DashboardShell.tsx
│   │   │
│   │   ├── /dashboard
│   │   │   ├── DashboardOverview.tsx
│   │   │   ├── StatsCards.tsx
│   │   │   ├── Charts.tsx
│   │   │   └── QuickActions.tsx
│   │   │
│   │   ├── /forms
│   │   │   ├── CustomerForm.tsx
│   │   │   ├── ProductForm.tsx
│   │   │   ├── OrderForm.tsx
│   │   │   ├── InvoiceForm.tsx
│   │   │   └── ...
│   │   │
│   │   ├── /tables
│   │   │   ├── CustomersTable.tsx
│   │   │   ├── ProductsTable.tsx
│   │   │   ├── OrdersTable.tsx
│   │   │   ├── InvoicesTable.tsx
│   │   │   └── ...
│   │   │
│   │   ├── /seumei                       # Design system da Seumei
│   │   │   ├── theme-provider.tsx
│   │   │   ├── theme-colors.tsx
│   │   │   └── design-tokens.ts
│   │   │
│   │   └── /common                       ← Componentes comuns
│   │       ├── ErrorBoundary.tsx
│   │       ├── Loading.tsx
│   │       ├── EmptyState.tsx
│   │       └── NotFound.tsx
│   │
│   ├── /lib                              # Bibliotecas e utilitários
│   │   ├── db.ts                         # Prisma client
│   │   ├── auth.ts                       # Configuração de auth
│   │   ├── stripe.ts                     # Stripe client (isolado)
│   │   ├── validators.ts                 # Validações Zod
│   │   ├── errors.ts                     # Classes de erro customizadas
│   │   ├── logger.ts                     # Logger centralizado
│   │   └── utils.ts                      # Funções utilitárias
│   │
│   ├── /styles                           # Estilos globais
│   │   ├── globals.css
│   │   ├── variables.css
│   │   └── animations.css
│   │
│   └── /env.ts                           # Validação de env vars
│
├── /prisma                               # Prisma
│   ├── schema.prisma                     # Schema completo (este arquivo)
│   └── migrations/                       # Migrações
│
├── /public                               # Assets públicos
│   ├── logo.svg
│   ├── favicon.ico
│   └── ...
│
├── /tests                                # Testes
│   ├── /unit
│   ├── /integration
│   └── /e2e
│
├── .env.example                          # Variáveis de exemplo
├── .env.local                            # Variáveis locais (git ignored)
├── next.config.ts                        # Configuração Next.js
├── tsconfig.json                         # Configuração TypeScript
├── tailwind.config.ts                    # Tailwind CSS
├── package.json
├── README.md
└── ARCHITECTURE.md                       # Este arquivo
```

---

## 5. PADRÕES DE IMPLEMENTAÇÃO

### 5.1 Repository Pattern

```typescript
// domains/customers/repositories/customer.repository.ts
import { prisma } from '@/lib/db'

export interface ICustomerRepository {
  create(workspaceId: string, data: CreateCustomerDTO): Promise<Customer>
  findById(workspaceId: string, id: string): Promise<Customer | null>
  findMany(workspaceId: string, filters?: CustomerFilters): Promise<Customer[]>
  update(workspaceId: string, id: string, data: UpdateCustomerDTO): Promise<Customer>
  delete(workspaceId: string, id: string): Promise<void>
}

export class CustomerRepository implements ICustomerRepository {
  async create(workspaceId: string, data: CreateCustomerDTO) {
    return prisma.customer.create({
      data: {
        workspaceId, // OBRIGATÓRIO
        ...data,
      },
    })
  }

  async findById(workspaceId: string, id: string) {
    return prisma.customer.findFirst({
      where: {
        id,
        workspaceId, // ISOLAMENTO
      },
    })
  }

  async findMany(workspaceId: string, filters?: CustomerFilters) {
    return prisma.customer.findMany({
      where: {
        workspaceId, // ISOLAMENTO
        ...(filters?.name && { name: { contains: filters.name, mode: 'insensitive' } }),
      },
      take: filters?.limit || 50,
      skip: filters?.offset || 0,
    })
  }

  // ... outros métodos
}
```

### 5.2 Service Layer

```typescript
// domains/features/services/features.service.ts
import { BillingService } from '@/domains/billing'
import { WalletService } from '@/domains/wallet'

export class FeaturesService {
  constructor(
    private billingService: BillingService,
    private walletService: WalletService,
  ) {}

  async canAccessFeature(workspaceId: string, featureCode: string): Promise<boolean> {
    // ✅ CORRETO: Usa BillingService (abstração)
    // ❌ NUNCA: Conheceria Stripe diretamente
    const hasAccess = await this.billingService.checkFeatureAccess(
      workspaceId,
      featureCode,
    )
    return hasAccess
  }

  async activateFeature(workspaceId: string, featureCode: string) {
    // Validação
    const feature = await this.findFeature(featureCode)
    if (!feature) throw new FeatureNotFoundError()

    // Verificar se workspace pode ativar
    const canActivate = await this.canAccessFeature(workspaceId, featureCode)
    if (!canActivate) {
      // Verificar se pode comprar com moedas
      const wallet = await this.walletService.getWallet(workspaceId)
      if (wallet.balance < feature.price) {
        throw new InsufficientFundsError()
      }
      // Deduzir moedas
      await this.walletService.debit(workspaceId, feature.price)
    }

    // Ativar feature
    return prisma.workspaceFeature.create({
      data: {
        workspaceId,
        featureId: feature.id,
        source: 'STORE',
      },
    })
  }
}
```

### 5.3 Server Actions

```typescript
// domains/customers/actions/create-customer.action.ts
'use server'

import { redirect } from 'next/navigation'
import { validateRequest } from '@/lib/auth'
import { CustomerService } from '@/domains/customers/services/customer.service'

export async function createCustomerAction(
  workspaceId: string,
  formData: FormData,
) {
  // 1. Validar autenticação
  const { user } = await validateRequest()
  if (!user) {
    redirect('/login')
  }

  // 2. Validar acesso ao workspace
  const hasAccess = await checkWorkspaceAccess(user.id, workspaceId)
  if (!hasAccess) {
    throw new UnauthorizedError()
  }

  // 3. Parse e validar dados
  const { name, email, phone } = Object.fromEntries(formData)
  const validation = CreateCustomerSchema.safeParse({ name, email, phone })
  if (!validation.success) {
    return { error: validation.error.flatten() }
  }

  // 4. Chamar service
  const service = new CustomerService()
  const customer = await service.create(workspaceId, validation.data)

  // 5. Audit
  await auditLog(workspaceId, user.id, 'CREATE', 'CUSTOMER', customer.id)

  // 6. Retornar resultado
  return { success: true, customer }
}
```

### 5.4 Middleware de Workspace

```typescript
// lib/middleware/workspace.middleware.ts
import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromToken } from '@/domains/auth'

export async function workspaceMiddleware(request: NextRequest) {
  const session = await getSessionFromToken(request)
  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Extrair workspace da URL
  const workspaceMatch = request.nextUrl.pathname.match(/\/\[workspace\]\/(.+)/)
  if (!workspaceMatch) {
    return NextResponse.next()
  }

  const workspaceId = workspaceMatch[1]

  // Validar que usuário tem acesso a este workspace
  const membership = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId: session.user.id,
      },
      isActive: true,
    },
  })

  if (!membership) {
    return NextResponse.redirect(new URL('/unauthorized', request.url))
  }

  // Adicionar ao contexto
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-workspace-id', workspaceId)
  requestHeaders.set('x-workspace-role', membership.role)

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}
```

### 5.5 Hook de Context

```typescript
// lib/hooks/useWorkspace.ts
'use client'

import { useHeaders } from 'next/headers'

export function useWorkspace() {
  const headers = useHeaders()
  const workspaceId = headers.get('x-workspace-id')
  const role = headers.get('x-workspace-role')

  if (!workspaceId) {
    throw new Error('Workspace not found in context')
  }

  return {
    workspaceId,
    role,
    canRead: role ? ['OWNER', 'ADMIN', 'MANAGER', 'OPERATOR', 'VIEWER'].includes(role) : false,
    canWrite: role ? ['OWNER', 'ADMIN', 'MANAGER'].includes(role) : false,
    isAdmin: role === 'ADMIN' || role === 'OWNER',
  }
}
```

---

## 6. UI/UX RULEBOOK

### 6.1 Princípios de Design

```
1. **Loading States**
   - Toda ação assíncrona deve mostrar estado de loading
   - Skeletons para tabelas, cards para dados em paralelo
   - Spinners para ações curtas (< 3s)
   - Progressbar para ações longas (> 3s)

2. **Error Handling**
   - Toast para erros simples (campo inválido)
   - Dialog para erros críticos (falha na transação)
   - Error boundary em toda página
   - Log de erro em console para dev

3. **Empty States**
   - Ilustração + título + descrição
   - CTA primária (criar novo)
   - Link para docs/suporte

4. **Server Components**
   - Padrão: Server Component
   - Exception: Interatividade (formulários, filtros)
   - Suspense para carregamento paralelo

5. **Error Boundaries**
   - Root: ErrorBoundary global
   - Por feature: ErrorBoundary local
   - Recovery: Retry button + support link

6. **Mini Dashboards**
   - Toda seção principal tem overview
   - KPIs em cards (número grande, trend, descrição)
   - Última atualização no footer

7. **Organização Dinâmica**
   - Rotas baseadas em features ativas
   - Menu dinâmico via ComponentLayout
   - Permissões controlam visibilidade
```

### 6.2 Componentes Obrigatórios

```
// Validação de dados
const OrderFormSchema = z.object({
  customerId: z.string().uuid(),
  items: z.array(z.object({
    productId: z.string().uuid(),
    quantity: z.number().int().positive(),
  })),
  total: z.number().positive(),
})

// Form com server action
<form action={createOrderAction} className="space-y-4">
  <input name="customerId" required />
  <textarea name="description" />
  <button type="submit">Criar Pedido</button>
</form>

// Tabela com paginação
<DataTable
  columns={columns}
  data={orders}
  pagination={{
    pageIndex: 0,
    pageSize: 10,
    pageCount: Math.ceil(total / 10),
  }}
/>

// Error boundary
<ErrorBoundary fallback={<ErrorFallback retry={() => window.location.reload()} />}>
  <DashboardContent />
</ErrorBoundary>

// Loading fallback
<Suspense fallback={<OrdersTableSkeleton />}>
  <OrdersTable workspaceId={workspaceId} />
</Suspense>
```

---

## 7. SISTEMA DE TEMPLATES

### 7.1 Fluxo de Onboarding

```
User clicks "Sign up"
     ↓
Create User (auth domain)
     ↓
Create Workspace (FREE plan)
     ↓
Create EnterpriseMother (com dados do formulário)
     ↓
User escolhe categoria/template
     ↓
Apply ThemeUI (baseado no template)
     ↓
Activate trial features (7 dias)
     ↓
Add initial wallet coins (para testes)
     ↓
Start OnboardingFlow
     ↓
Show first step/tutorial
     ↓
Track completion via OnboardingCompletion
```

### 7.2 Templates por Nicho

```
DELIVERY (Serviço de delivery)
├── Features: Orders, Customers, Delivery tracking
├── Theme: Dark colors (modern delivery feel)
├── Sample data: 5 fake orders
└── Suggested extensions: Delivery integration, Notification system

AUTONOMO (Profissional autônomo)
├── Features: Quotes, Invoicing, Payments
├── Theme: Professional blue
├── Sample data: 2 quotes, 1 invoice
└── Suggested extensions: Branding kit

COMERCIO (Comércio geral)
├── Features: Products, Orders, Finance
├── Theme: Warm colors
├── Sample data: 20 products, 5 orders
└── Suggested extensions: POS integration

SERVICOS (Prestação de serviço)
├── Features: Quotes, Scheduling, Invoices
├── Theme: Professional colors
├── Sample data: 3 quotes
└── Suggested extensions: Calendar sync
```

---

## 8. DESIGN PATTERNS

### 8.1 Patterns Implementados

```
1. REPOSITORY PATTERN
   Domain → Repository Interface → Prisma Client
   Benefício: Abstração de dados, testável

2. SERVICE LAYER
   UI/API → Service → Repository → DB
   Benefício: Lógica centralizada, reutilização

3. DOMAIN EVENTS
   Entity change → Event emitted → Listeners notificados
   Benefício: Desacoplamento, auditoria automática

4. FACTORY PATTERN
   Workspace creation → Factory cria subdominios
   Benefício: Inicialização consistente, menos código

5. STRATEGY PATTERN
   BillingStrategy (Plans vs Coins)
   PaymentStrategy (PIX, DAS, etc)
   Benefício: Extensibilidade

6. ADAPTER PATTERN
   Stripe → BillingAdapter → BillingService
   Benefício: Troca fácil de provider

7. MIDDLEWARE PATTERN
   Request → Workspace validation → Handler
   Benefício: Autenticação, autorização centralizada

8. DECORATOR PATTERN
   @Transactional, @Cached, @Logged
   Benefício: Cross-cutting concerns

9. SPECIFICATION PATTERN
   UserSpecs.isActive().and(hasWorkspaceAccess())
   Benefício: Queries complexas, reutilizáveis

10. VALUE OBJECT
    Money { amount, currency }
    Email { address, isVerified }
    Benefício: Type safety, validação embutida
```

---

## 9. FLUXOS DE NEGÓCIO

### 9.1 Fluxo de Venda Completo

```
1. CREATE QUOTE
   Customer + Items
   ↓
   ✅ Quote created (status: PENDING)
   ↓
   AnalyticsEvent("QUOTE_CREATED", customerId, quoteId)

2. APPROVE QUOTE
   User → Quote > Approve button
   ↓
   ✅ Quote.status = APPROVED
   ↓
   MessageTemplate sent (SMS/Email)

3. CONVERT TO ORDER
   Quote.convertToOrderId = orderId
   ↓
   ✅ Order created (status: PENDING)
   ↓
   AnalyticsEvent("ORDER_CREATED", customerId, orderId)

4. CONFIRM ORDER
   Order.status = CONFIRMED
   ↓
   ✅ Notification sent

5. CREATE INVOICE
   Order.invoiceId = invoiceId
   ↓
   ✅ Invoice created (status: ISSUED)
   ↓
   Invoice PDF generated

6. SEND INVOICE
   Invoice.status = SENT
   ↓
   MessageTemplate sent (Email)

7. RECEIVE PAYMENT
   PaymentLink or PixPayment received
   ↓
   Invoice.paidAt = now
   Invoice.status = PAID
   ↓
   Transaction.status = COMPLETED
   ↓
   DunningJob cancelled (if was pending)

8. COMPLETE
   Order.status = COMPLETED
   ↓
   AnalyticsEvent("ORDER_COMPLETED", customerId, orderId)
   ↓
   AuditLog("Order completed", orderId)
```

### 9.2 Fluxo de Pagamento (PIX)

```
1. CREATE PAYMENT LINK
   Amount + Reference (Invoice/Order/Quote)
   ↓
   ✅ PaymentLink created (status: ACTIVE, expires in 3 days)
   ✅ QR Code generated

2. SHARE LINK
   User sends link to customer
   ↓
   Customer opens link
   ✅ PaymentPage shown

3. SCAN QR CODE
   Customer scans QR code via PIX app
   ↓
   ✅ PixPayment created (status: PENDING)
   ✅ Webhook listener configured

4. RECEIVE PIX
   Bank webhook: PIX_RECEIVED
   ↓
   ✅ PixPayment.status = PAID
   ✅ PaymentLink.status = PAID
   ✅ Invoice.paidAt = received_time
   ✅ Transaction.status = COMPLETED

5. APPLY SPLIT (if configured)
   Transaction received → SplitRule triggered
   ↓
   Loop through SplitAllocation:
   - Calculate amount (percentage or fixed)
   - Create SplitTransaction per recipient
   ✅ Notify recipients
```

---

## 10. SPRINTS DE IMPLEMENTAÇÃO

### Sprint 1: Core Foundation (Semana 1-2)

**Objetivo:** Setup base, auth, workspace, multitenancy

**Entregáveis:**
- [x] Project setup (Next.js, Prisma, Auth)
- [x] User & Session models
- [x] Workspace & WorkspaceMember models
- [x] Auth flow (register, login, logout)
- [x] Workspace creation on signup
- [x] Middleware de workspace validation
- [x] AuditLog básico

**Dependências:** Nenhuma

---

### Sprint 2: Enterprise & Billing (Semana 3-4)

**Objetivo:** Enterprise setup, isolamento billing, planos

**Entregáveis:**
- [ ] Enterprise model & service
- [ ] EnterpriseMother creation
- [ ] Subscription model (isolado)
- [ ] Plan model & service
- [ ] BillingService (abstração)
- [ ] StripeWebhook handlers
- [ ] Plan selection UI

**Dependências:** Sprint 1

---

### Sprint 3: Wallet & Features (Semana 5-6)

**Objetivo:** Sistema de moedas, features, marketplace

**Entregáveis:**
- [ ] Wallet model & service
- [ ] WalletTransaction service
- [ ] Feature model & service
- [ ] WorkspaceFeature activation
- [ ] Feature store (marketplace UI)
- [ ] Feature trial logic (7 days)
- [ ] Coins initial allocation

**Dependências:** Sprint 1, 2

---

### Sprint 4: Theme & UI (Semana 7-8)

**Objetivo:** Sistema de design, customização visual

**Entregáveis:**
- [ ] ThemeUI model & service
- [ ] ThemePreset system
- [ ] ComponentLayout model & service
- [ ] Design token system
- [ ] Dark mode support
- [ ] Theme customization UI
- [ ] ThemePreset templates

**Dependências:** Sprint 1

---

### Sprint 5: Sales Domain (Semana 9-10)

**Objetivo:** Vendas, clientes, pedidos, orçamentos

**Entregáveis:**
- [ ] Customer model & service
- [ ] Product & ProductCategory models
- [ ] Quote model & conversion logic
- [ ] Order model & workflow
- [ ] OrderItem & QuoteItem
- [ ] Quote → Order conversion
- [ ] Sales pages & forms

**Dependências:** Sprint 1

---

### Sprint 6: Finance Domain (Semana 11-12)

**Objetivo:** Faturas, transações, contas bancárias

**Entregáveis:**
- [ ] Invoice model & service
- [ ] InvoiceItem model
- [ ] Transaction model & service
- [ ] BankAccount model
- [ ] BankTransaction model
- [ ] Reconciliation logic
- [ ] Finance dashboard

**Dependências:** Sprint 5

---

### Sprint 7: Payments Domain (Semana 13-14)

**Objetivo:** PIX, DAS, links, divisão

**Entregáveis:**
- [ ] PixPayment & PixKey models
- [ ] DasPayment model
- [ ] PaymentLink model & service
- [ ] SplitRule & SplitAllocation
- [ ] VirtualAccount model
- [ ] Payment flow integration
- [ ] Payment pages

**Dependências:** Sprint 6, Stripe integration

---

### Sprint 8: Onboarding & Templates (Semana 15-16)

**Objetivo:** Fluxo de onboarding, templates por nicho

**Entregáveis:**
- [ ] OnboardingFlow model
- [ ] OnboardingCompletion tracking
- [ ] OnboardingTemplate system
- [ ] Category-specific templates
- [ ] Initial data seeding
- [ ] Onboarding UI flow
- [ ] Progress tracking

**Dependências:** Sprint 1-4

---

### Sprint 9: Permissions & Audit (Semana 17-18)

**Objetivo:** RBAC, permissões, auditoria completa

**Entregáveis:**
- [ ] RolePermission & ModulePermission
- [ ] PermissionService (RBAC)
- [ ] Module & ModuleConfig
- [ ] AuditLog complete
- [ ] Audit dashboard
- [ ] Permission-based UI hiding
- [ ] Compliance reports

**Dependências:** Sprint 1

---

### Sprint 10: Analytics & System (Semana 19-20)

**Objetivo:** Eventos, métricas, notificações, dunning

**Entregáveis:**
- [ ] AnalyticsEvent & Metric models
- [ ] AnalyticsService
- [ ] MessageTemplate system
- [ ] Aviso (notification) system
- [ ] DunningPolicy & Jobs
- [ ] PipelineEvent (automação)
- [ ] Analytics dashboard

**Dependências:** Sprint 1-9

---

### Sprint 11: Integration & Polish (Semana 21-22)

**Objetivo:** Integração completa, testes, polish

**Entregáveis:**
- [ ] E2E tests
- [ ] Performance optimization
- [ ] Mobile responsiveness
- [ ] SEO optimization
- [ ] Documentation complete
- [ ] Admin dashboard
- [ ] Bug fixes & refinements

**Dependências:** Sprint 1-10

---

### Sprint 12: Production & Go-Live (Semana 23-24)

**Objetivo:** Deploy, monitoring, rollout

**Entregáveis:**
- [ ] Production deployment
- [ ] Monitoring setup (Sentry, DataDog)
- [ ] Backup & disaster recovery
- [ ] Incident response procedures
- [ ] Documentation for ops
- [ ] Gradual rollout (0% → 100%)
- [ ] Support procedures

**Dependências:** Sprint 11

---

## 11. DECISÕES ARQUITETURAIS

### AD-1: Workspace Como Tenant (vs User)

**Decisão:** Workspace é o agregado raiz, não User

**Motivo:**
- Escalabilidade: Suporta franquias, múltiplas lojas
- Compliance: Isolamento de dados (LGPD)
- Flexibilidade: User pode ter múltiplos workspaces
- Negócio: Workspace tem seu próprio plano/wallet

**Alternativa Rejeitada:** User como tenant
- ❌ Não escalaria para franquias
- ❌ Difícil de implementar LGPD
- ❌ Não permite múltiplos workspaces por user

### AD-2: Billing Domain Isolado

**Decisão:** Stripe fica em domain/billing isolado

**Motivo:**
- Features nunca conhecem Stripe diretamente
- Fácil trocar de provider (Braintree, Square)
- Testável sem Stripe
- Segurança: Stripe keypairs em um lugar só

**Padrão:** BillingService como abstração
```typescript
// ✅ Features usam abstração
const hasAccess = await billingService.checkFeatureAccess(workspaceId, 'AI')

// ❌ Features NUNCA importam Stripe
import Stripe from 'stripe' // NUNCA
```

### AD-3: Soft Economy (Coins vs Hard Currency)

**Decisão:** Sistema de moedas internas (coins) que nunca acabam

**Motivo:**
- Flexibilidade: Pode dar coins por comportamento
- Monetização: Pode vender coins ou recursos
- Experiência: User não fica "preso"
- IA-ready: Coins para AI consumption sem real money

**Modelo:**
- Ganho: Onboarding (100), Plano (10/mês), Promoção
- Gasto: Extension (50), AI tokens (1-10)
- Never negative: Validação no service

### AD-4: UI Como Dado (Configurável)

**Decisão:** Layout e design salvos no banco (ComponentLayout, ThemeUI)

**Motivo:**
- White-label: Cada loja tem seu próprio design
- Escalável: Sem deploy para customizações
- Moldável: User pode organizar componentes
- Data-driven: UI segue dados do banco

**Implementação:**
- `ThemeUI`: Cores, tipografia, layout
- `ThemePreset`: Presets pré-feitos
- `ComponentLayout`: Componentes por página

### AD-5: Multitenancy via Schema + RLS

**Decisão:** Dados isolados por workspace em todas as queries

**Motivo:**
- Segurança: Impossível vazar dados entre tenants
- Performance: Queries pequenas por workspace
- Compliance: Isolamento obrigatório

**Invariante:**
```typescript
// ✅ SEMPRE
where: { workspaceId, ... }

// ❌ NUNCA
where: { ... } // sem workspaceId
```

### AD-6: Features Desacopladas de Planos

**Decisão:** Feature ≠ Plan
- Feature é capacidade do sistema (SMART_SALES, AI_ANALYTICS)
- Plan é grupo de features (FREE, PRO, ENTERPRISE)
- WorkspaceFeature rastreia estado

**Motivo:**
- Flexibilidade: Ativar feature sem ser plano
- Marketplace: Comprar feature individual com coins
- Trial: Feature expirar sem afetar plano

### AD-7: DDD com Next.js App Router

**Decisão:** Domains em `/src/domains`, separado de rotas

**Motivo:**
- Clean architecture: Negócio separado de UI
- Testável: Services não conhecem Next.js
- Escalável: Mesmo domain em múltiplos apps
- Maintível: Mudanças de UI não afetam domain

### AD-8: Server Components + Server Actions

**Decisão:** Padrão é server component + server action

**Exceção:** Client component para interatividade

**Motivo:**
- Segurança: Lógica no servidor
- Performance: Menos JS no cliente
- Simpleza: Sem API boilerplate
- Type-safe: TypeScript end-to-end

---

## 12. CHECKLIST DE IMPLEMENTAÇÃO

### Phase 1: Core Setup

- [ ] Projeto Next.js criado
- [ ] Prisma configurado + migrations
- [ ] Banco de dados (PostgreSQL) rodando
- [ ] Auth com NextAuth configurado
- [ ] Variáveis de ambiente validadas
- [ ] Middleware de workspace funcional
- [ ] Logging centralizado
- [ ] Error handling global

### Phase 2: Multitenancy

- [ ] User e Workspace models prontos
- [ ] WorkspaceMember criado (roles)
- [ ] Enterprise e EnterpriseMother
- [ ] RLS policies no banco
- [ ] Workspace creation flow
- [ ] Workspace isolation testado
- [ ] Audit logging básico
- [ ] Tests de isolamento

### Phase 3: Billing (ISOLADO)

- [ ] Subscription model
- [ ] Plan model + CRUD
- [ ] BillingService criado
- [ ] Stripe SDK integrado
- [ ] Webhooks de Stripe
- [ ] Subscription lifecycle (create, update, cancel)
- [ ] Plan selection UI
- [ ] Billing dashboard

### Phase 4: Wallet & Features

- [ ] Wallet model + service
- [ ] WalletTransaction tracking
- [ ] Feature catalog
- [ ] WorkspaceFeature ativação
- [ ] Trial expiration logic
- [ ] Marketplace UI
- [ ] Coins initial allocation
- [ ] Feature availability checks

### Phase 5: Theme System

- [ ] ThemeUI model
- [ ] ThemePreset system
- [ ] ComponentLayout model
- [ ] Design token system
- [ ] Dark mode support
- [ ] Theme application engine
- [ ] Customization UI
- [ ] Design system docs

### Phase 6: Sales Modules

- [ ] Customer CRUD
- [ ] Product CRUD
- [ ] ProductCategory CRUD
- [ ] Quote creation & approval
- [ ] Quote → Order conversion
- [ ] Order workflow
- [ ] Sales dashboard
- [ ] Tests de fluxo

### Phase 7: Finance Modules

- [ ] Invoice creation
- [ ] Invoice PDF generation
- [ ] Transaction tracking
- [ ] BankAccount CRUD
- [ ] BankTransaction import
- [ ] Reconciliation logic
- [ ] Finance dashboard
- [ ] Report generation

### Phase 8: Payments Modules

- [ ] PixPayment integration
- [ ] PixKey management
- [ ] DasPayment support
- [ ] PaymentLink generation
- [ ] SplitRule configuration
- [ ] VirtualAccount setup
- [ ] Payment webhooks
- [ ] Payment success flow

### Phase 9: Onboarding

- [ ] OnboardingFlow setup
- [ ] OnboardingCompletion tracking
- [ ] Category-specific templates
- [ ] Initial data seeding
- [ ] Onboarding UI flow
- [ ] Progress tracking
- [ ] Completion celebration
- [ ] Tests

### Phase 10: Permissions & System

- [ ] RBAC system
- [ ] Module management
- [ ] Module permissions
- [ ] Feature flags system
- [ ] Message templates
- [ ] Avisos (notifications)
- [ ] Dunning system
- [ ] Permission tests

### Phase 11: Analytics & Monitoring

- [ ] Analytics events tracking
- [ ] Metrics aggregation
- [ ] Analytics dashboard
- [ ] Performance monitoring (Sentry)
- [ ] Error tracking
- [ ] Usage analytics
- [ ] Custom reports
- [ ] Alerts setup

### Phase 12: Polish & Production

- [ ] Mobile responsiveness
- [ ] Accessibility audit (a11y)
- [ ] Performance optimization
- [ ] SEO optimization
- [ ] Security audit
- [ ] E2E tests
- [ ] Load testing
- [ ] Documentation complete
- [ ] Deployment pipeline
- [ ] Monitoring setup
- [ ] Incident procedures

---

## 13. CONCLUSÃO

Este documento consolida **100% da arquitetura da Seumei** extraída dos documentos fornecidos e validada contra as melhores práticas de DDD, Clean Architecture e SaaS multitenant.

### Princípios Fundamentais Revalidados

✅ **Workspace é o agregado raiz** — Tenant principal do sistema  
✅ **Billing é domain isolado** — Features nunca conhecem Stripe  
✅ **UI é configurável** — Temas e layouts como dados  
✅ **Economia é soft** — Coins nunca acabam  
✅ **Escalável** — Suporta 100K+ workspaces  
✅ **Moldável** — Extensões, templates, marketplace  
✅ **LGPD-ready** — Isolamento desde dia 1  

### Próximos Passos

1. **Código Fonte:** Implementar schema Prisma completo
2. **Backend:** Services, repositories, actions
3. **Frontend:** Componentes, pages, integração
4. **Testes:** Unit, integration, E2E
5. **Deploy:** CI/CD, monitoring, escalabilidade
6. **Iteração:** Feedback → melhorias → v2.0

---

**Versão:** 1.0  
**Data:** 2024-12-30  
**Status:** ✅ PRONTO PARA IMPLEMENTAÇÃO  
**Mantenedor:** Equipe Seumei

**Este documento é o blueprint oficial da Seumei v1.0.**
