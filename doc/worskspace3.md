// ============================================
// SCHEMA PRISMA - SEUMEI V1 (BASE ENTERPRISE)
// ============================================
// Sistema multitenant modular com:
// - Workspace como container principal
// - EnterpriseMother (lojas/unidades)
// - Marketplace interno de apps/extensões
// - UI dinâmica e configurável por loja
// - Sistema de moedas/wallet
// - Features desacopladas de planos

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DB_PRISMA_URL")
  directUrl = env("DB_URL_NON_POOLING")
}

// ============================================
// 1️⃣ USER — Identidade pura (Auth)
// ============================================
// 🔒 User não possui: plano, wallet, dados de negócio
// Tudo fica no Workspace

model User {
  id        String   @id @default(cuid())
  name      String?
  email     String?  @unique
  emailVerifiedAt DateTime? @map(name: "email_verified_at")
  avatarUrl String?  @map(name: "avatar_url")
  status    UserStatus @default(ACTIVE)
  lastLoginAt DateTime? @map(name: "last_login_at")
  
  // Auth relations
  sessions               Session[]
  emailVerificationCodes EmailVerificationCode[]
  
  // Workspace relations
  workspaceMemberships   WorkspaceMember[]
  
  // Legacy - remover depois da migração
  projects               Project[]
  
  createdAt DateTime @default(now()) @map(name: "created_at")
  updatedAt DateTime @updatedAt @map(name: "updated_at")

  @@map(name: "users")
  @@index([email])
  @@index([status])
}

enum UserStatus {
  ACTIVE
  BLOCKED
  DELETED
}

// ============================================
// 2️⃣ WORKSPACE — Universo / Container / Franquia
// ============================================
// 🧠 Workspace detém: regras, limites, plano, expansão
// É o tenant principal no sistema multitenant

model Workspace {
  id        String   @id @default(cuid())
  name      String
  slug      String   @unique // URL-friendly, usado para subdomínios/rotas
  description String?
  
  // Tipo e categoria
  type      WorkspaceType @default(SINGLE_BUSINESS)
  category  WorkspaceCategory @default(LIVRE)
  status    WorkspaceStatus @default(ACTIVE)
  
  // Plano e billing (movido do User)
  plan      WorkspacePlan @default(FREE)
  planStartedAt DateTime @map(name: "plan_started_at")
  planExpiresAt DateTime? @map(name: "plan_expires_at")
  
  // Stripe integration
  stripeCustomerId       String?   @unique @map(name: "stripe_customer_id")
  stripeSubscriptionId   String?   @unique @map(name: "stripe_subscription_id")
  stripePriceId          String?   @map(name: "stripe_price_id")
  stripeCurrentPeriodEnd DateTime? @map(name: "stripe_current_period_end")
  
  // Settings JSON (flexível para evolução)
  settings  Json     @default("{}") // WorkspaceSettings
  
  // Relations
  members           WorkspaceMember[]
  enterprises       Enterprise[]
  projects          Project[]
  features          WorkspaceFeature[]
  wallet            Wallet?
  themes            ThemeUI[]
  componentLayouts  ComponentLayout[]
  extensions        WorkspaceExtension[]
  
  // EnterpriseMother (empresa mãe principal)
  enterpriseMotherId String?  @unique @map(name: "enterprise_mother_id")
  enterpriseMother   Enterprise? @relation("EnterpriseMother", fields: [enterpriseMotherId], references: [id], onDelete: SetNull)
  
  createdById String   @map(name: "created_by_id")
  
  createdAt DateTime @default(now()) @map(name: "created_at")
  updatedAt DateTime @updatedAt @map(name: "updated_at")

  @@map(name: "workspaces")
  @@index([slug])
  @@index([status])
  @@index([plan])
  @@index([type])
}

enum WorkspaceType {
  SINGLE_BUSINESS  // Negócio único
  FRANCHISE        // Franquia (múltiplas unidades)
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

enum WorkspacePlan {
  FREE
  PRO
  ENTERPRISE
}

// ============================================
// 3️⃣ WORKSPACE MEMBER — Papel real no negócio
// ============================================
// Suporta: PDV, equipes, franquias, permissões futuras

model WorkspaceMember {
  id          String   @id @default(cuid())
  workspaceId String   @map(name: "workspace_id")
  userId      String   @map(name: "user_id")
  
  role        WorkspaceRole @default(VIEWER)
  permissions String[] // Array de permissões customizadas
  isActive    Boolean  @default(true) @map(name: "is_active")
  
  workspace   Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  joinedAt    DateTime @default(now()) @map(name: "joined_at")
  lastActionAt DateTime? @map(name: "last_action_at")
  
  createdAt   DateTime @default(now()) @map(name: "created_at")
  updatedAt   DateTime @updatedAt @map(name: "updated_at")

  @@unique([workspaceId, userId])
  @@map(name: "workspace_members")
  @@index([workspaceId])
  @@index([userId])
  @@index([isActive])
}

enum WorkspaceRole {
  OWNER     // Criador, acesso total
  ADMIN     // Pode gerenciar membros e empresas
  MANAGER   // Pode criar/editar empresas e projetos
  OPERATOR  // Operacional (PDV, deliveries)
  VIEWER    // Apenas leitura
}

// ============================================
// 4️⃣ ENTERPRISE MOTHER — Empresa / Loja / Unidade
// ============================================
// 🧠 Cada loja/unidade é uma EnterpriseMother
// CRÍTICA para multitenancy

model Enterprise {
  id          String   @id @default(cuid())
  workspaceId String   @map(name: "workspace_id")
  
  // Identificação
  type        EnterpriseType // AUTONOMO ou EMPRESA
  legalName   String?  @map(name: "legal_name") // Razão social
  tradeName   String   @map(name: "trade_name") // Nome fantasia
  document    String?  @unique // CNPJ ou CPF
  documentType EnterpriseDocumentType @default(NONE) @map(name: "document_type")
  
  // Segmentação
  segment     String   // Ex: "Delivery", "Restaurante"
  subSegment  String?  @map(name: "sub_segment") // Ex: "Pizza", "Hambúrguer"
  
  // Status
  isMain      Boolean  @default(false) @map(name: "is_main") // Empresa mãe do workspace
  isActive    Boolean  @default(true) @map(name: "is_active")
  
  // Contato (JSON flexível)
  contact     Json     @default("{}") // EnterpriseContact
  
  // Endereço (JSON flexível)
  address     Json?    // EnterpriseAddress
  
  // Relations
  workspace         Workspace       @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  workspaceAsMother Workspace?      @relation("EnterpriseMother")
  themes            ThemeUI[]
  componentLayouts  ComponentLayout[]
  
  createdById String?  @map(name: "created_by_id")
  
  createdAt   DateTime @default(now()) @map(name: "created_at")
  updatedAt   DateTime @updatedAt @map(name: "updated_at")

  @@map(name: "enterprises")
  @@index([workspaceId])
  @@index([document])
  @@index([type])
  @@index([isMain])
  @@index([isActive])
}

enum EnterpriseType {
  AUTONOMO  // Pessoa física/autônomo
  EMPRESA   // Pessoa jurídica
}

enum EnterpriseDocumentType {
  CPF
  CNPJ
  NONE
}

// ============================================
// 5️⃣ THEME UI — Design como dado
// ============================================
// Suporta: compra de tema, troca por loja, layout por unidade

model ThemeUI {
  id                String   @id @default(cuid())
  workspaceId       String   @map(name: "workspace_id")
  enterpriseMotherId String  @map(name: "enterprise_mother_id")
  
  themeType         ThemeUIType @map(name: "theme_type")
  themeName         String   @map(name: "theme_name")
  
  // Design tokens (JSON flexível)
  colors            Json     // ThemeColors
  typography        Json     // ThemeTypography
  layout            Json     // ThemeLayout
  
  darkModeEnabled   Boolean  @default(false) @map(name: "dark_mode_enabled")
  
  workspace         Workspace  @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  enterprise        Enterprise @relation(fields: [enterpriseMotherId], references: [id], onDelete: Cascade)
  
  createdAt DateTime @default(now()) @map(name: "created_at")
  updatedAt DateTime @updatedAt @map(name: "updated_at")

  @@unique([workspaceId, enterpriseMotherId])
  @@map(name: "theme_ui")
  @@index([workspaceId])
  @@index([enterpriseMotherId])
}

enum ThemeUIType {
  SYSTEM   // Tema padrão do sistema
  TEMPLATE // Tema de template (delivery, comércio, etc)
  CUSTOM   // Tema customizado pelo usuário
}

// ============================================
// 6️⃣ FEATURE — Capacidades do sistema
// ============================================
// Features são desacopladas de planos
// Categoria: CORE, AI, AUTOMATION, UI

model Feature {
  id          String   @id @default(cuid())
  code        String   @unique // Ex: "SMART_SALES", "AI_ANALYTICS"
  name        String
  category    FeatureCategory
  description String?
  
  // Plano mínimo requerido (opcional)
  requiresPlan WorkspacePlan? @map(name: "requires_plan")
  
  // Disponibilidade
  isActive    Boolean  @default(true) @map(name: "is_active")
  isPublic    Boolean  @default(false) @map(name: "is_public") // Aparece na loja
  
  // Metadata
  icon        String?
  version     String   @default("1.0.0")
  
  createdAt DateTime @default(now()) @map(name: "created_at")
  updatedAt DateTime @updatedAt @map(name: "updated_at")

  // Relations
  workspaceFeatures WorkspaceFeature[]

  @@map(name: "features")
  @@index([code])
  @@index([category])
  @@index([isActive])
}

enum FeatureCategory {
  CORE        // Funcionalidades core do sistema
  AI          // Inteligência artificial
  AUTOMATION  // Automações
  UI          // Componentes de UI
  INTEGRATION // Integrações externas
}

// ============================================
// 7️⃣ WORKSPACE FEATURE — Feature como estado
// ============================================
// 🧠 Feature ≠ Plano
// Plano libera, feature ativa

model WorkspaceFeature {
  id          String   @id @default(cuid())
  workspaceId String   @map(name: "workspace_id")
  featureId   String   @map(name: "feature_id")
  
  source      FeatureSource // Como a feature foi obtida
  enabled     Boolean  @default(true)
  enabledAt   DateTime? @map(name: "enabled_at")
  expiresAt   DateTime? @map(name: "expires_at") // Para trials
  
  // Configuração específica do workspace
  config      Json     @default("{}")
  
  workspace   Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  feature     Feature   @relation(fields: [featureId], references: [id], onDelete: Cascade)
  
  createdAt DateTime @default(now()) @map(name: "created_at")
  updatedAt DateTime @updatedAt @map(name: "updated_at")

  @@unique([workspaceId, featureId])
  @@map(name: "workspace_features")
  @@index([workspaceId])
  @@index([featureId])
  @@index([enabled])
}

enum FeatureSource {
  PLAN        // Incluída no plano
  STORE       // Comprada na loja
  PROMOTION   // Promoção/trial
  ONBOARDING  // Ganha no onboarding
}

// ============================================
// 8️⃣ COMPONENT LAYOUT — UI moldável
// ============================================
// 🧠 Isso é o coração do sistema moldável
// Usuário organiza telas que aparecem por loja

model ComponentLayout {
  id                String   @id @default(cuid())
  workspaceId       String   @map(name: "workspace_id")
  enterpriseMotherId String  @map(name: "enterprise_mother_id")
  
  layoutVersion     Int      @default(1) @map(name: "layout_version")
  
  // Componentes configurados (JSON array)
  components        Json     // UIComponentConfig[]
  
  workspace         Workspace  @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  enterprise        Enterprise @relation(fields: [enterpriseMotherId], references: [id], onDelete: Cascade)
  
  createdAt DateTime @default(now()) @map(name: "created_at")
  updatedAt DateTime @updatedAt @map(name: "updated_at")

  @@unique([workspaceId, enterpriseMotherId])
  @@map(name: "component_layouts")
  @@index([workspaceId])
  @@index([enterpriseMotherId])
}

// ============================================
// 9️⃣ WALLET — Economia do Workspace
// ============================================
// Sistema de moedas para comprar apps, extensões, AI tokens

model Wallet {
  id              String   @id @default(cuid())
  workspaceId     String   @unique @map(name: "workspace_id")
  
  balance         Decimal  @default(0) @db.Decimal(15, 2)
  reservedBalance Decimal  @default(0) @map(name: "reserved_balance") @db.Decimal(15, 2)
  currency        String   @default("COIN")
  
  workspace       Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  transactions    WalletTransaction[]
  
  createdAt DateTime @default(now()) @map(name: "created_at")
  updatedAt DateTime @updatedAt @map(name: "updated_at")

  @@map(name: "wallets")
  @@index([workspaceId])
}

// ============================================
// 🔟 WALLET TRANSACTION — Tudo rastreável
// ============================================

model WalletTransaction {
  id          String   @id @default(cuid())
  walletId    String   @map(name: "wallet_id")
  
  type        WalletTransactionType
  amount      Decimal  @db.Decimal(15, 2)
  source      WalletTransactionSource
  
  referenceId String?  @map(name: "reference_id") // ID da extensão, feature, etc
  description String?
  
  wallet      Wallet   @relation(fields: [walletId], references: [id], onDelete: Cascade)
  
  createdAt DateTime @default(now()) @map(name: "created_at")

  @@map(name: "wallet_transactions")
  @@index([walletId])
  @@index([type])
  @@index([source])
  @@index([createdAt])
}

enum WalletTransactionType {
  EARN    // Ganhou moedas
  SPEND   // Gastou moedas
  RESERVE // Reservou (ex: compra pendente)
  RELEASE // Liberou reserva
}

enum WalletTransactionSource {
  ONBOARDING    // Ganhou no onboarding
  PLAN          // Ganhou pelo plano
  EXTENSION     // Compra de extensão
  AI_USAGE      // Consumo de IA
  PROMOTION     // Promoção
  REFUND        // Estorno
}

// ============================================
// 1️⃣1️⃣ EXTENSION — Marketplace interno
// ============================================
// Apps, extensões e ferramentas da loja

model Extension {
  id          String   @id @default(cuid())
  code        String   @unique // Identificador único
  name        String
  description String?
  category    ExtensionCategory
  
  // Preço e moedas
  price       Decimal  @db.Decimal(10, 2) // Preço em moedas
  isFree      Boolean  @default(false) @map(name: "is_free")
  
  // Disponibilidade
  isActive    Boolean  @default(true) @map(name: "is_active")
  isPublished Boolean  @default(false) @map(name: "is_published")
  
  // Metadata
  icon        String?
  version     String   @default("1.0.0")
  configSchema Json?   @map(name: "config_schema") // Schema de configuração
  
  createdAt DateTime @default(now()) @map(name: "created_at")
  updatedAt DateTime @updatedAt @map(name: "updated_at")
  
  // Relations
  workspaceExtensions WorkspaceExtension[]

  @@map(name: "extensions")
  @@index([code])
  @@index([category])
  @@index([isPublished])
}

enum ExtensionCategory {
  APP         // Aplicativo completo
  WIDGET      // Widget/componente
  INTEGRATION // Integração externa
  AUTOMATION  // Automação
  AI          // Ferramenta de IA
}

// ============================================
// 1️⃣2️⃣ WORKSPACE EXTENSION — Extensão instalada
// ============================================

model WorkspaceExtension {
  id          String   @id @default(cuid())
  workspaceId String   @map(name: "workspace_id")
  extensionId String   @map(name: "extension_id")
  
  enabled     Boolean  @default(true)
  config      Json     @default("{}") // Configuração específica
  
  workspace   Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  extension   Extension @relation(fields: [extensionId], references: [id], onDelete: Cascade)
  
  installedAt DateTime @default(now()) @map(name: "installed_at")
  updatedAt   DateTime @updatedAt @map(name: "updated_at")

  @@unique([workspaceId, extensionId])
  @@map(name: "workspace_extensions")
  @@index([workspaceId])
  @@index([extensionId])
}

// ============================================
// LEGACY MODELS (mantidos para compatibilidade)
// ============================================

model Session {
  id        String   @id @default(cuid())
  userId    String
  expiresAt DateTime
  user      User     @relation(references: [id], fields: [userId], onDelete: Cascade)
}

model EmailVerificationCode {
  id        String   @id @default(cuid())
  code      String
  userId    String
  email     String
  expiresAt DateTime
  user      User     @relation(references: [id], fields: [userId], onDelete: Cascade)
}

model Project {
  id          String   @id @default(cuid())
  name        String
  domain      String
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // Migração para Workspace
  workspaceId String? @map(name: "workspace_id")
  workspace   Workspace? @relation(fields: [workspaceId], references: [id], onDelete: SetNull)
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map(name: "projects")
}

// ============================================
// CONTINUAÇÃO DO SCHEMA - MÓDULOS DE NEGÓCIO
// ============================================

// ============================================
// 1️⃣2️⃣ CUSTOMERS — Clientes
// ============================================

model Customer {
  id          String   @id @default(cuid())
  workspaceId String   @map(name: "workspace_id")
  enterpriseId String? @map(name: "enterprise_id") // Cliente pode estar vinculado a uma loja específica
  
  // Dados pessoais
  name        String
  email       String?
  phone       String?
  document    String?  @unique // CPF/CNPJ
  documentType CustomerDocumentType? @map(name: "document_type")
  
  // Endereço
  address     Json?
  
  // Status
  status      CustomerStatus @default(ACTIVE)
  
  // Metadata
  tags        String[]
  notes       String?
  
  workspace   Workspace  @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  enterprise  Enterprise? @relation(fields: [enterpriseId], references: [id], onDelete: SetNull)
  
  // Relations
  orders      Order[]
  quotes      Quote[]
  invoices    Invoice[]
  
  createdAt DateTime @default(now()) @map(name: "created_at")
  updatedAt DateTime @updatedAt @map(name: "updated_at")

  @@map(name: "customers")
  @@index([workspaceId])
  @@index([enterpriseId])
  @@index([document])
  @@index([status])
}

enum CustomerDocumentType {
  CPF
  CNPJ
}

enum CustomerStatus {
  ACTIVE
  INACTIVE
  BLOCKED
}

// ============================================
// 1️⃣3️⃣ PRODUCTS — Produtos
// ============================================

model Product {
  id          String   @id @default(cuid())
  workspaceId String   @map(name: "workspace_id")
  enterpriseId String? @map(name: "enterprise_id")
  
  // Identificação
  name        String
  sku         String?  @unique // SKU único
  barcode     String?  @unique
  
  // Categorização
  categoryId  String?  @map(name: "category_id")
  category    ProductCategory? @relation(fields: [categoryId], references: [id], onDelete: SetNull)
  
  // Preços
  price       Decimal  @db.Decimal(15, 2)
  costPrice   Decimal? @map(name: "cost_price") @db.Decimal(15, 2)
  
  // Estoque
  trackStock  Boolean  @default(false) @map(name: "track_stock")
  stockQuantity Decimal? @map(name: "stock_quantity") @db.Decimal(15, 2)
  
  // Descrição e mídia
  description String?
  images      String[] // URLs das imagens
  
  // Status
  status      ProductStatus @default(ACTIVE)
  
  // Metadata
  tags        String[]
  
  workspace   Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  enterprise  Enterprise? @relation(fields: [enterpriseId], references: [id], onDelete: SetNull)
  
  // Relations
  orderItems  OrderItem[]
  quoteItems  QuoteItem[]
  invoiceItems InvoiceItem[]
  
  createdAt DateTime @default(now()) @map(name: "created_at")
  updatedAt DateTime @updatedAt @map(name: "updated_at")

  @@map(name: "products")
  @@index([workspaceId])
  @@index([enterpriseId])
  @@index([categoryId])
  @@index([sku])
  @@index([status])
}

model ProductCategory {
  id          String   @id @default(cuid())
  workspaceId String   @map(name: "workspace_id")
  
  name        String
  description String?
  parentId    String?  @map(name: "parent_id")
  parent      ProductCategory? @relation("CategoryHierarchy", fields: [parentId], references: [id], onDelete: SetNull)
  children    ProductCategory[] @relation("CategoryHierarchy")
  
  workspace   Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  products    Product[]
  
  createdAt DateTime @default(now()) @map(name: "created_at")
  updatedAt DateTime @updatedAt @map(name: "updated_at")

  @@map(name: "product_categories")
  @@index([workspaceId])
  @@index([parentId])
}

enum ProductStatus {
  ACTIVE
  INACTIVE
  ARCHIVED
}

// ============================================
// 1️⃣4️⃣ ORDERS — Pedidos
// ============================================

model Order {
  id          String   @id @default(cuid())
  workspaceId String   @map(name: "workspace_id")
  enterpriseId String  @map(name: "enterprise_id")
  
  // Numeração
  orderNumber String   @unique @map(name: "order_number") // Número sequencial por workspace
  
  // Cliente
  customerId  String?  @map(name: "customer_id")
  customer    Customer? @relation(fields: [customerId], references: [id], onDelete: SetNull)
  
  // Status
  status      OrderStatus @default(PENDING)
  
  // Valores
  subtotal    Decimal  @db.Decimal(15, 2)
  discount    Decimal  @default(0) @db.Decimal(15, 2)
  tax         Decimal  @default(0) @db.Decimal(15, 2)
  total       Decimal  @db.Decimal(15, 2)
  
  // Pagamento
  paymentStatus PaymentStatus @default(PENDING) @map(name: "payment_status")
  
  // Observações
  notes       String?
  
  workspace   Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  enterprise  Enterprise @relation(fields: [enterpriseId], references: [id], onDelete: Cascade)
  
  // Relations
  items       OrderItem[]
  
  createdAt DateTime @default(now()) @map(name: "created_at")
  updatedAt DateTime @updatedAt @map(name: "updated_at")

  @@map(name: "orders")
  @@index([workspaceId])
  @@index([enterpriseId])
  @@index([customerId])
  @@index([status])
  @@index([orderNumber])
}

model OrderItem {
  id          String   @id @default(cuid())
  orderId     String   @map(name: "order_id")
  
  productId   String?  @map(name: "product_id")
  product     Product? @relation(fields: [productId], references: [id], onDelete: SetNull)
  
  // Dados do item (snapshot)
  name        String
  quantity    Decimal  @db.Decimal(15, 2)
  unitPrice   Decimal  @map(name: "unit_price") @db.Decimal(15, 2)
  discount    Decimal  @default(0) @db.Decimal(15, 2)
  total       Decimal  @db.Decimal(15, 2)
  
  order       Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  
  createdAt DateTime @default(now()) @map(name: "created_at")

  @@map(name: "order_items")
  @@index([orderId])
  @@index([productId])
}

enum OrderStatus {
  PENDING
  CONFIRMED
  PROCESSING
  SHIPPED
  DELIVERED
  CANCELLED
  RETURNED
}

enum PaymentStatus {
  PENDING
  PARTIAL
  PAID
  REFUNDED
  FAILED
}

// ============================================
// 1️⃣5️⃣ QUOTES — Orçamentos
// ============================================

model Quote {
  id          String   @id @default(cuid())
  workspaceId String   @map(name: "workspace_id")
  enterpriseId String  @map(name: "enterprise_id")
  
  // Numeração
  quoteNumber String   @unique @map(name: "quote_number")
  
  // Cliente
  customerId  String?  @map(name: "customer_id")
  customer    Customer? @relation(fields: [customerId], references: [id], onDelete: SetNull)
  
  // Status
  status      QuoteStatus @default(DRAFT)
  
  // Valores
  subtotal    Decimal  @db.Decimal(15, 2)
  discount    Decimal  @default(0) @db.Decimal(15, 2)
  tax         Decimal  @default(0) @db.Decimal(15, 2)
  total       Decimal  @db.Decimal(15, 2)
  
  // Validade
  validUntil  DateTime? @map(name: "valid_until")
  
  // Conversão
  convertedToOrderId String? @unique @map(name: "converted_to_order_id")
  
  workspace   Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  enterprise  Enterprise @relation(fields: [enterpriseId], references: [id], onDelete: Cascade)
  
  items       QuoteItem[]
  
  createdAt DateTime @default(now()) @map(name: "created_at")
  updatedAt DateTime @updatedAt @map(name: "updated_at")

  @@map(name: "quotes")
  @@index([workspaceId])
  @@index([enterpriseId])
  @@index([customerId])
  @@index([status])
}

model QuoteItem {
  id          String   @id @default(cuid())
  quoteId     String   @map(name: "quote_id")
  
  productId   String?  @map(name: "product_id")
  product     Product? @relation(fields: [productId], references: [id], onDelete: SetNull)
  
  name        String
  quantity    Decimal  @db.Decimal(15, 2)
  unitPrice   Decimal  @map(name: "unit_price") @db.Decimal(15, 2)
  discount    Decimal  @default(0) @db.Decimal(15, 2)
  total       Decimal  @db.Decimal(15, 2)
  
  quote       Quote    @relation(fields: [quoteId], references: [id], onDelete: Cascade)
  
  createdAt DateTime @default(now()) @map(name: "created_at")

  @@map(name: "quote_items")
  @@index([quoteId])
  @@index([productId])
}

enum QuoteStatus {
  DRAFT
  SENT
  ACCEPTED
  REJECTED
  EXPIRED
  CONVERTED
}

// ============================================
// 1️⃣6️⃣ INVOICES — Faturas
// ============================================

model Invoice {
  id          String   @id @default(cuid())
  workspaceId String   @map(name: "workspace_id")
  enterpriseId String  @map(name: "enterprise_id")
  
  // Numeração
  invoiceNumber String @unique @map(name: "invoice_number")
  
  // Cliente
  customerId  String?  @map(name: "customer_id")
  customer    Customer? @relation(fields: [customerId], references: [id], onDelete: SetNull)
  
  // Status
  status      InvoiceStatus @default(DRAFT)
  
  // Valores
  subtotal    Decimal  @db.Decimal(15, 2)
  discount    Decimal  @default(0) @db.Decimal(15, 2)
  tax         Decimal  @default(0) @db.Decimal(15, 2)
  total       Decimal  @db.Decimal(15, 2)
  paidAmount  Decimal  @default(0) @map(name: "paid_amount") @db.Decimal(15, 2)
  
  // Datas
  issuedAt    DateTime @map(name: "issued_at")
  dueDate     DateTime @map(name: "due_date")
  paidAt      DateTime? @map(name: "paid_at")
  
  workspace   Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  enterprise  Enterprise @relation(fields: [enterpriseId], references: [id], onDelete: Cascade)
  
  items       InvoiceItem[]
  transactions Transaction[]
  
  createdAt DateTime @default(now()) @map(name: "created_at")
  updatedAt DateTime @updatedAt @map(name: "updated_at")

  @@map(name: "invoices")
  @@index([workspaceId])
  @@index([enterpriseId])
  @@index([customerId])
  @@index([status])
  @@index([invoiceNumber])
  @@index([dueDate])
}

model InvoiceItem {
  id          String   @id @default(cuid())
  invoiceId   String   @map(name: "invoice_id")
  
  productId   String?  @map(name: "product_id")
  product     Product? @relation(fields: [productId], references: [id], onDelete: SetNull)
  
  name        String
  quantity    Decimal  @db.Decimal(15, 2)
  unitPrice   Decimal  @map(name: "unit_price") @db.Decimal(15, 2)
  discount    Decimal  @default(0) @db.Decimal(15, 2)
  total       Decimal  @db.Decimal(15, 2)
  
  invoice     Invoice  @relation(fields: [invoiceId], references: [id], onDelete: Cascade)
  
  createdAt DateTime @default(now()) @map(name: "created_at")

  @@map(name: "invoice_items")
  @@index([invoiceId])
  @@index([productId])
}

enum InvoiceStatus {
  DRAFT
  ISSUED
  PARTIAL
  PAID
  OVERDUE
  CANCELLED
}

// ============================================
// 1️⃣7️⃣ TRANSACTIONS — Transações financeiras
// ============================================

model Transaction {
  id          String   @id @default(cuid())
  workspaceId String   @map(name: "workspace_id")
  enterpriseId String? @map(name: "enterprise_id")
  
  // Referência
  invoiceId   String?  @map(name: "invoice_id")
  invoice     Invoice? @relation(fields: [invoiceId], references: [id], onDelete: SetNull)
  
  // Tipo e valor
  type        TransactionType
  amount      Decimal  @db.Decimal(15, 2)
  
  // Método de pagamento
  paymentMethod PaymentMethod @map(name: "payment_method")
  
  // Status
  status      TransactionStatus @default(PENDING)
  
  // Datas
  processedAt DateTime? @map(name: "processed_at")
  
  // Metadata
  description String?
  metadata    Json?
  
  workspace   Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  enterprise  Enterprise? @relation(fields: [enterpriseId], references: [id], onDelete: SetNull)
  
  createdAt DateTime @default(now()) @map(name: "created_at")
  updatedAt DateTime @updatedAt @map(name: "updated_at")

  @@map(name: "transactions")
  @@index([workspaceId])
  @@index([enterpriseId])
  @@index([invoiceId])
  @@index([type])
  @@index([status])
  @@index([paymentMethod])
}

enum TransactionType {
  INCOME    // Receita
  EXPENSE   // Despesa
  TRANSFER  // Transferência
}

enum TransactionStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
  CANCELLED
}

enum PaymentMethod {
  CASH
  CREDIT_CARD
  DEBIT_CARD
  PIX
  BANK_TRANSFER
  DAS
  OTHER
}

// ============================================
// 1️⃣8️⃣ PIX — Pagamentos PIX
// ============================================

model PixKey {
  id          String   @id @default(cuid())
  workspaceId String   @map(name: "workspace_id")
  enterpriseId String  @map(name: "enterprise_id")
  
  key         String   @unique // Chave PIX (CPF, CNPJ, Email, Telefone, Aleatória)
  keyType     PixKeyType @map(name: "key_type")
  
  isActive    Boolean  @default(true) @map(name: "is_active")
  
  workspace   Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  enterprise  Enterprise @relation(fields: [enterpriseId], references: [id], onDelete: Cascade)
  
  payments    PixPayment[]
  
  createdAt DateTime @default(now()) @map(name: "created_at")
  updatedAt DateTime @updatedAt @map(name: "updated_at")

  @@map(name: "pix_keys")
  @@index([workspaceId])
  @@index([enterpriseId])
  @@index([key])
}

enum PixKeyType {
  CPF
  CNPJ
  EMAIL
  PHONE
  RANDOM
}

model PixPayment {
  id          String   @id @default(cuid())
  workspaceId String   @map(name: "workspace_id")
  enterpriseId String? @map(name: "enterprise_id")
  
  pixKeyId    String?  @map(name: "pix_key_id")
  pixKey      PixKey?  @relation(fields: [pixKeyId], references: [id], onDelete: SetNull)
  
  // Dados do pagamento
  amount      Decimal  @db.Decimal(15, 2)
  description String?
  
  // QR Code
  qrCode      String?  @map(name: "qr_code")
  qrCodeImage String?  @map(name: "qr_code_image")
  
  // Status
  status      PixPaymentStatus @default(PENDING)
  
  // Identificadores externos
  endToEndId  String?  @unique @map(name: "end_to_end_id")
  txId        String?  @unique @map(name: "tx_id")
  
  // Datas
  expiresAt   DateTime? @map(name: "expires_at")
  paidAt      DateTime? @map(name: "paid_at")
  
  workspace   Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  enterprise  Enterprise? @relation(fields: [enterpriseId], references: [id], onDelete: SetNull)
  
  createdAt DateTime @default(now()) @map(name: "created_at")
  updatedAt DateTime @updatedAt @map(name: "updated_at")

  @@map(name: "pix_payments")
  @@index([workspaceId])
  @@index([pixKeyId])
  @@index([status])
  @@index([endToEndId])
}

enum PixPaymentStatus {
  PENDING
  CREATED
  PROCESSING
  COMPLETED
  EXPIRED
  CANCELLED
  FAILED
}

// ============================================
// 1️⃣9️⃣ DAS PAYMENTS — Pagamentos DAS (MEI)
// ============================================

model DasPayment {
  id          String   @id @default(cuid())
  workspaceId String   @map(name: "workspace_id")
  enterpriseId String  @map(name: "enterprise_id")
  
  // Referência DAS
  referenceNumber String @unique @map(name: "reference_number")
  period          String // Mês/ano de referência (MM/AAAA)
  
  // Valores
  amount          Decimal @db.Decimal(15, 2)
  principal       Decimal @db.Decimal(15, 2)
  interest        Decimal @default(0) @db.Decimal(15, 2)
  fine            Decimal @default(0) @db.Decimal(15, 2)
  
  // Status
  status          DasPaymentStatus @default(PENDING)
  
  // Datas
  dueDate         DateTime @map(name: "due_date")
  paidAt          DateTime? @map(name: "paid_at")
  
  // Código de barras
  barcode         String?
  
  workspace   Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  enterprise  Enterprise @relation(fields: [enterpriseId], references: [id], onDelete: Cascade)
  
  createdAt DateTime @default(now()) @map(name: "created_at")
  updatedAt DateTime @updatedAt @map(name: "updated_at")

  @@map(name: "das_payments")
  @@index([workspaceId])
  @@index([enterpriseId])
  @@index([referenceNumber])
  @@index([status])
  @@index([dueDate])
}

enum DasPaymentStatus {
  PENDING
  PAID
  OVERDUE
  CANCELLED
}

// ============================================
// 2️⃣0️⃣ BANK ACCOUNTS — Contas bancárias
// ============================================

model BankAccount {
  id          String   @id @default(cuid())
  workspaceId String   @map(name: "workspace_id")
  enterpriseId String  @map(name: "enterprise_id")
  
  // Dados bancários
  bankCode    String   @map(name: "bank_code") // Código do banco (001, 237, etc)
  bankName    String   @map(name: "bank_name")
  agency      String
  account     String
  accountDigit String  @map(name: "account_digit")
  accountType BankAccountType @map(name: "account_type")
  
  // Titular
  holderName  String   @map(name: "holder_name")
  holderDocument String @map(name: "holder_document")
  
  // Status
  isActive    Boolean  @default(true) @map(name: "is_active")
  isDefault   Boolean  @default(false) @map(name: "is_default")
  
  workspace   Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  enterprise  Enterprise @relation(fields: [enterpriseId], references: [id], onDelete: Cascade)
  
  transactions BankTransaction[]
  
  createdAt DateTime @default(now()) @map(name: "created_at")
  updatedAt DateTime @updatedAt @map(name: "updated_at")

  @@map(name: "bank_accounts")
  @@index([workspaceId])
  @@index([enterpriseId])
  @@index([isActive])
}

enum BankAccountType {
  CHECKING  // Conta corrente
  SAVINGS   // Poupança
}

// ============================================
// 2️⃣1️⃣ BANK TRANSACTIONS — Transações bancárias
// ============================================

model BankTransaction {
  id            String   @id @default(cuid())
  bankAccountId String   @map(name: "bank_account_id")
  
  // Tipo
  type          BankTransactionType
  
  // Valor
  amount        Decimal  @db.Decimal(15, 2)
  
  // Descrição
  description   String?
  
  // Data
  date          DateTime
  postedAt      DateTime? @map(name: "posted_at")
  
  // Balance
  balance       Decimal? @db.Decimal(15, 2)
  
  // Referência externa
  externalId    String?  @unique @map(name: "external_id")
  
  bankAccount   BankAccount @relation(fields: [bankAccountId], references: [id], onDelete: Cascade)
  
  createdAt DateTime @default(now()) @map(name: "created_at")

  @@map(name: "bank_transactions")
  @@index([bankAccountId])
  @@index([type])
  @@index([date])
  @@index([externalId])
}

enum BankTransactionType {
  DEBIT
  CREDIT
}

// Continua na próxima mensagem devido ao tamanho...