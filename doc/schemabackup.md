// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DB_PRISMA_URL") // uses connection pooling
  directUrl = env("DB_URL_NON_POOLING") // uses a direct connection
}

// ============================================
// ENUMS
// ============================================

enum UserStatus {
  ACTIVE
  BLOCKED
  DELETED
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

enum WorkspaceRole {
  OWNER
  ADMIN
  MANAGER
  OPERATOR
  VIEWER
}

enum EnterpriseType {
  AUTONOMO
  EMPRESA
}

enum EnterpriseDocumentType {
  CPF
  CNPJ
  NONE
}

enum SubscriptionStatus {
  ACTIVE
  CANCELED
  PAST_DUE
  UNPAID
  TRIALING
}

enum BillingCycle {
  MONTHLY
  YEARLY
  LIFETIME
}

enum WalletTransactionType {
  ONBOARDING_BONUS
  PLAN_REWARD
  PROMOTION
  EXTENSION_PURCHASE
  AI_CONSUMPTION
  MANUAL_CREDIT
  MANUAL_DEBIT
}

enum FeatureCategory {
  CORE
  AI
  AUTOMATION
  UI
  INTEGRATION
}

enum WorkspacePlan {
  FREE
  PRO
  ENTERPRISE
}

enum FeatureSource {
  PLAN
  STORE
  PROMOTION
  ONBOARDING
}

enum ThemeUIType {
  SYSTEM
  TEMPLATE
  CUSTOM
}

enum GlobalUserR  id              String     @id @default(cuid())
  name            String?
  email           String?    @unique
  emailVerifiedAt DateTime?
  picture         String? // Mantido para compatibilidade - será migrado para avatarUrl
  status          UserStatus @default(ACTIVE)
  lastLoginAt     DateTime?

  // DEPRECATED: Campos Stripe serão migrados para Subscription
  // TODO: Remover após migration script executar
  stripeCustomerId       String?   @unique @map(name: "stripe_customer_id")
  stripeSubscriptionId   String?   @unique @map(name: "stripe_subscription_id")
  stripePriceId          String?   @map(name: "stripe_price_id")
  stripeCurrentPeriodEnd DateTime? @map(name: "stripe_current_period_end")

  sessions               Session[]
  emailVerificationCodes EmailVerificationCode[]
  workspaceMemberships   WorkspaceMember[]
  projects               Project[] // Temporário - será migrado

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([email])
  @@index([status])
  @@map("users")
}

model Session {
  id        String   @id @default(cuid())
  userId    String
  token     String   @unique
  expiresAt DateTime

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())

  @@index([userId])
  @@index([token])
  @@index([expiresAt])
  @@map("sessions")
}

model EmailVerificationCode {
  id        String   @id @default(cuid())
  userId    String
  code      String   @unique
  email     String
  expiresAt DateTime

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())

  @@index([userId])
  @@index([code])
  @@index([expiresAt])
  @@map("email_verification_codes")
}

// ============================================
// WORKSPACE (CORE)
// ============================================

model Workspace {
  id          String  @id @default(cuid())
  name        String
  slug        String  @unique
  description String?

  // Classificação
  type     WorkspaceType     @default(SINGLE_BUSINESS)
  category WorkspaceCategory @default(LIVRE)
  status   WorkspaceStatus   @default(ACTIVE)

  // Settings flexíveis
  settings Json @default("{}")

  // Relações principais
  members          WorkspaceMember[]
  enterprises      Enterprise[]
  features         WorkspaceFeature[]
  wallet           Wallet?
  subscription     Subscription?
  themes           ThemeUI[]
  componentLayouts ComponentLayout[]

  // Empresa mãe (1:1)
  enterpriseMotherId String?     @unique
  enterpriseMother   Enterprise? @relation("EnterpriseMother", fields: [enterpriseMotherId], references: [id], onDelete: SetNull)

  // Dados de negócio (preparados para futuras fases)
  // customers         Customer[]
  // orders            Order[]
  // quotes            Quote[]
  // products          Product[]
  // productCategories ProductCategory[]
  // invoices          Invoice[]
  // transactions      Transaction[]
  // bankAccounts      BankAccount[]
  // pixPayments       PixPayment[]
  // dasPayments       DasPayment[]
  // paymentLinks      PaymentLink[]
  // meiProfiles       MeiProfile[]
  // virtualAccounts   VirtualAccount[]
  // auditLogs         AuditLog[]
  // analyticsEvents   AnalyticsEvent[]
  // analyticsMetrics  AnalyticsMetric[]

  // Sistema (preparados para futuras fases)
  // avisos            Aviso[]
  // messageTemplates  MessageTemplate[]
  // moduleConfigs     ModuleConfig[]
  // splitRules        SplitRule[]
  // dunningPolicies   DunningPolicy[]
  // dunningJobs       DunningJob[]

  createdById     String
  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt
  WorkspaceInvite WorkspaceInvite[]

  @@index([slug])
  @@index([status])
  @@index([type])
  @@index([category])
  @@map("workspaces")
}

model WorkspaceMember {
  id          String @id @default(cuid())
  workspaceId String
  userId      String

  role        WorkspaceRole @default(VIEWER)
  permissions String[] // Array de permissões customizadas
  isActive    Boolean       @default(true)

  workspace Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  joinedAt     DateTime  @default(now())
  lastActionAt DateTime?
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt

  @@unique([workspaceId, userId])
  @@index([workspaceId])
  @@index([userId])
  @@index([role])
  @@index([isActive])
  @@map("workspace_members")
}

model WorkspaceInvite {
  id          String        @id @default(cuid())
  workspaceId String
  email       String
  role        WorkspaceRole @default(VIEWER)

  token      String    @unique
  expiresAt  DateTime
  acceptedAt DateTime?
  revokedAt  DateTime?

  workspace Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)

  @@unique([workspaceId, email])
  @@index([workspaceId])
  @@index([token])
  @@index([expiresAt])
  @@map("workspace_invites")
}

// ============================================
// ENTERPRISE
// ============================================

model Enterprise {
  id          String @id @default(cuid())
  workspaceId String

  // Identificação
  type         EnterpriseType
  legalName    String?
  tradeName    String
  document     String?                @unique
  documentType EnterpriseDocumentType @default(NONE)

  // Segmentação
  segment    String // Delivery, Restaurante, etc
  subSegment String?

  // Status
  isMain   Boolean @default(false)
  isActive Boolean @default(true)

  // Endereço
  address Json? // { street, number, city, state, zip }
  contact Json // { phone, email, website }

  // Relacionamentos
  workspace         Workspace         @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  workspaceAsMother Workspace?        @relation("EnterpriseMother")
  themes            ThemeUI[]
  componentLayouts  ComponentLayout[]
  // meiProfiles       MeiProfile[] // Futura fase

  createdById String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([workspaceId])
  @@index([document])
  @@index([type])
  @@index([isMain])
  @@index([isActive])
  @@map("enterprises")
}

// ============================================
// BILLING (ISOLADO)
// ============================================

model Subscription {
  id          String @id @default(cuid())
  workspaceId String @unique

  planId String
  plan   Plan   @relation(fields: [planId], references: [id])

  // Status
  status SubscriptionStatus @default(ACTIVE)

  // Período
  currentPeriodStart DateTime
  currentPeriodEnd   DateTime

  // Stripe (isolado aqui)
  stripeCustomerId     String? @unique
  stripeSubscriptionId String? @unique
  stripePriceId        String?

  workspace Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([workspaceId])
  @@index([status])
  @@index([planId])
  @@map("subscriptions")
}

model Plan {
  id          String  @id @default(cuid())
  code        String  @unique
  name        String
  description String?

  // Preço
  price        Decimal      @db.Decimal(15, 2)
  currency     String       @default("BRL")
  billingCycle BillingCycle

  // Stripe
  stripePriceId String? @unique

  // Features incluídas (JSON array)
  features Json @default("[]")

  // Limites
  limits Json @default("{}")

  // Status
  isActive Boolean @default(true)
  isPublic Boolean @default(true)

  subscriptions Subscription[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([code])
  @@index([isActive])
  @@map("plans")
}

// ============================================
// WALLET & FEATURES
// ============================================

model Wallet {
  id          String @id @default(cuid())
  workspaceId String @unique

  balance         Decimal @default(0) @db.Decimal(15, 2)
  reservedBalance Decimal @default(0) @db.Decimal(15, 2)
  currency        String  @default("COIN")

  workspace    Workspace           @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  transactions WalletTransaction[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([workspaceId])
  @@map("wallets")
}

model WalletTransaction {
  id       String @id @default(cuid())
  walletId String

  type        WalletTransactionType
  amount      Decimal               @db.Decimal(15, 2)
  description String

  // Referência do que gerou
  referenceType String?
  referenceId   String?

  wallet Wallet @relation(fields: [walletId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())

  @@index([walletId])
  @@index([type])
  @@index([createdAt])
  @@map("wallet_transactions")
}

model Feature {
  id          String          @id @default(cuid())
  code        String          @unique
  name        String
  category    FeatureCategory
  description String?

  // Plano mínimo requerido
  requiresPlan WorkspacePlan?

  // Status
  isActive Boolean @default(true)
  isPublic Boolean @default(false)

  // Metadata
  icon    String?
  version String  @default("1.0.0")

  workspaceFeatures WorkspaceFeature[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([code])
  @@index([category])
  @@index([isActive])
  @@map("features")
}

model WorkspaceFeature {
  id          String @id @default(cuid())
  workspaceId String
  featureId   String

  source    FeatureSource
  enabled   Boolean       @default(true)
  enabledAt DateTime?
  expiresAt DateTime? // Para trials

  // Configuração específica
  config Json @default("{}")

  workspace Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  feature   Feature   @relation(fields: [featureId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([workspaceId, featureId])
  @@index([workspaceId])
  @@index([enabled])
  @@index([expiresAt])
  @@map("workspace_features")
}

// ============================================
// THEME & UI
// ============================================

model ThemeUI {
  id                 String @id @default(cuid())
  workspaceId        String
  enterpriseMotherId String

  themeType ThemeUIType
  themeName String

  // Design tokens (JSON)
  colors     Json // { primary, secondary, accent, neutral }
  typography Json // { fontFamily, fontSizes, lineHeights }
  layout     Json // { spacing, borderRadius, shadows }

  darkModeEnabled Boolean @default(false)

  workspace  Workspace  @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  enterprise Enterprise @relation(fields: [enterpriseMotherId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([workspaceId, enterpriseMotherId])
  @@index([workspaceId])
  @@index([enterpriseMotherId])
  @@map("theme_ui")
}

model ThemePreset {
  id          String  @id @default(cuid())
  code        String  @unique
  name        String
  description String?

  // Categoria (qual nicho)
  category WorkspaceCategory?

  // Tema
  themeType ThemeUIType

  // Design tokens
  colors     Json
  typography Json
  layout     Json

  // Status
  isActive  Boolean @default(true)
  isPublic  Boolean @default(true)
  isPremium Boolean @default(false)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([code])
  @@index([category])
  @@index([isActive])
  @@map("theme_presets")
}

model ComponentLayout {
  id                 String @id @default(cuid())
  workspaceId        String
  enterpriseMotherId String

  layoutVersion Int @default(1)

  // Componentes configurados (JSON array)
  components Json // UIComponentConfig[]

  workspace  Workspace  @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  enterprise Enterprise @relation(fields: [enterpriseMotherId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([workspaceId, enterpriseMotherId])
  @@index([workspaceId])
  @@index([enterpriseMotherId])
  @@map("component_layouts")
erId String
  
  layoutVersion     Int      @default(1)
  
  // Componentes configurados (JSON array)
  components        Json     // UIComponentConfig[]
  
  workspace         Workspace  @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  enterprise        Enterprise @relation(fields: [enterpriseMotherId], references: [id], onDelete: Cascade)
  
  createdAt   id       String         @id @default(cuid())
  userId   String         @unique
  role     GlobalUserRole
  isActive Boolean        @default(true)
  @@index([enterpriseMotherId])
ue([workspaceId, enterpriseMotherId])
  @@index([workspaceId])
  @@index([enterpriseMotherId])
  @@map("component_layouts")
}

// ============================================
// ADMIN / GLOBAL ACCESS
// ============================================

model GlobalUser {
  id          String         @id @default(cuid())
  userId      String         @unique
  role        GlobalUserRole
  isActive    Boolean        @default(true)

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([userId])
  @@index([role])
  @@index([isActive])
  @@map("global_users")
}

// ============================================
// LEGACY (temporário - será migrado)
// ============================================

model Project {
  id        String   @id @default(cuid())
  name      String
  domain    String
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
