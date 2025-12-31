/ learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DB_PRISMA_URL") // uses connection pooling
  directUrl = env("DB_URL_NON_POOLING") // uses a direct connection
}

// ============================================
// EXISTING MODELS (mantidos)
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

model User {
  id                     String                  @id @unique @default(cuid())
  name                   String?
  email                  String?                 @unique
  emailVerified          Boolean?                @default(false)
  picture                String?
  githubId               Int?                    @unique
  sessions               Session[]
  emailVerificationCodes EmailVerificationCode[]

  // Stripe (mantido no User por enquanto, pode ser movido para Workspace depois)
  stripeCustomerId       String?   @unique @map(name: "stripe_customer_id")
  stripeSubscriptionId   String?   @unique @map(name: "stripe_subscription_id")
  stripePriceId          String?   @map(name: "stripe_price_id")
  stripeCurrentPeriodEnd DateTime? @map(name: "stripe_current_period_end")

  // Relações com Workspace
  workspaceMemberships   WorkspaceMember[]
  
  // Projetos podem pertencer a Workspace no futuro, mantendo User por compatibilidade
  projects               Project[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Project {
  id        String   @id @default(cuid())
  name      String
  domain    String
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // Futuro: projetos podem pertencer a Workspace
  workspaceId String? @map(name: "workspace_id")
  workspace   Workspace? @relation(fields: [workspaceId], references: [id], onDelete: SetNull)
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map(name: "projects")
}

// ============================================
// NEW MODELS - WORKSPACE & ENTERPRISE
// ============================================

model Workspace {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique // URL-friendly identifier
  description String?
  
  // Relações
  members     WorkspaceMember[]
  enterprises Enterprise[]
  projects    Project[]
  
  // EnterpriseMother (empresa mãe do workspace)
  enterpriseMotherId String?  @unique @map(name: "enterprise_mother_id")
  enterpriseMother   Enterprise? @relation("EnterpriseMother", fields: [enterpriseMotherId], references: [id], onDelete: SetNull)

  // Stripe pode ser movido para Workspace no futuro
  // stripeCustomerId String?
  // stripeSubscriptionId String?

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  createdById String   @map(name: "created_by_id") // User que criou o workspace
  
  @@map(name: "workspaces")
  @@index([slug])
}

model WorkspaceMember {
  id          String   @id @default(cuid())
  workspaceId String   @map(name: "workspace_id")
  userId      String   @map(name: "user_id")
  
  // Roles: OWNER, ADMIN, MEMBER, VIEWER
  role        WorkspaceRole @default(MEMBER)
  
  workspace   Workspace     @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  user        User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@unique([workspaceId, userId])
  @@map(name: "workspace_members")
  @@index([workspaceId])
  @@index([userId])
}

enum WorkspaceRole {
  OWNER   // Criador do workspace, acesso total
  ADMIN   // Pode gerenciar membros e empresas
  MEMBER  // Pode criar/editar empresas e projetos
  VIEWER  // Apenas leitura
}

// ============================================
// ENTERPRISE / COMPANY MODELS
// ============================================

model Enterprise {
  id          String   @id @default(cuid())
  workspaceId String   @map(name: "workspace_id")
  
  // Dados básicos
  name        String   // Razão social ou nome completo
  tradeName   String?  @map(name: "trade_name") // Nome fantasia (opcional)
  
  // Tipo de empresa
  type        EnterpriseType // CNPJ ou CPF
  
  // Identificação fiscal
  document    String   @unique // CNPJ (14 dígitos) ou CPF (11 dígitos)
  
  // Endereço
  address     String?
  city        String?
  state       String?
  zipCode     String?  @map(name: "zip_code")
  country     String?  @default("BR")
  
  // Contato
  email       String?
  phone       String?
  
  // Relações
  workspace   Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  
  // Relação especial: EnterpriseMother
  workspaceAsMother Workspace? @relation("EnterpriseMother", fields: [id], references: [id])

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  createdById String?  @map(name: "created_by_id")
  
  @@map(name: "enterprises")
  @@index([workspaceId])
  @@index([document])
  @@index([type])
}

enum EnterpriseType {
  CNPJ  // Pessoa Jurídica (empresa)
  CPF   // Pessoa Física
}

// ============================================
// ÍNDICES ADICIONAIS E OTIMIZAÇÕES
// ============================================

// Se quiser billing por workspace no futuro:
model Workspace {
  // ... campos existentes
  stripeCustomerId       String?   @unique
  stripeSubscriptionId   String?   @unique
  stripePriceId          String?
  stripeCurrentPeriodEnd DateTime?
}

// Se quiser convites para workspace:
model WorkspaceInvite {
  id          String   @id @default(cuid())
  workspaceId String
  email       String
  role        WorkspaceRole
  token       String   @unique
  expiresAt   DateTime
  acceptedAt  DateTime?
  
  @@unique([workspaceId, email])
}

sim sim, destrinche mais a parte de ser multitenanti, tbm: 
rfeito agora, escreva ou adicione novas infos aos MDS anteriores com: 

[30/12 13:27] Tainan Camargo: Sei que cê tá descansando, mas dps valida esse modelo mental 

Usuário tem um workspace, esse workspace pode ser uma franquia, então dentro de workspace user tem empresamae, podendo ser ele ou o CNPJ dele,

O usuário então pertence a um workspace, podendo ser dono da empresa ou fazer parte dela,

Geralmente delivery tem um ou dois usuário e geral acessa o mesmo, PDV tb,

Agora beleza, usuário paga plano e esse plano inclui várias coisas,

Mas dentro de workspace a gente tem uma loja de apps e extensões,

E o sistema tem muito componente / tela,

O usuário organiza as telas que aparecem na empresa mãe do workspace, podendo ter mais de uma loja, todas com configurações únicas / lojas únicas,

Loja já era esperado, 
A gente faz no dashboard tb,


Comecei a seumei do 0, a outra tava cheia de regras desnecessárias e arquivos misturados, agora tô seguindo um mapa mental novo
[30/12 13:31] Tainan Camargo: Me fala o que acha desse mapa mental e se faz sentido, se a gente tiver uma base v1 assim funcionandl, evolui pra qualquer nicho, ex:

Usuário cria conta free
Workspace é criado com empresa mãe

Tem um formulário de perguntas pra criar essa parte de cima, e agora vem o do sistema

Usuário escolhe um tema ( Delivery, Autônomo, Loja de material e construção , comércio, etc )

Após escolher um template é montado e vem dando opções de escolhas pra ele,

Algumas só vão estar disponíveis no pro, mas a gente libera o módulo pra ele, 

E ele ganha o teste máximo por 7 dias, mas pode rodar limitado depois, 

Quando ele cria o workspace, o workspace recebe X moedas,
Ele pode comprar apps, extensões e ferramentas < a ideia é as moedas nunca acabarem, um dia vai precisar de token pro consumo de AI tbm, ou pagamento dela via plano pro/Enterprise
🧱 SEUMEI — SCHEMAS CORE (VERSÃO ADULTA)
Convenções Globais
type ID = string
type JSON = Record<string, any>
type Timestamp = Date

1️⃣ User — Identidade pura (Auth)
export interface User {
  id: ID

  name: string
  email: string
  emailVerifiedAt?: Timestamp

  avatarUrl?: string

  status: 'ACTIVE' | 'BLOCKED' | 'DELETED'

  lastLoginAt?: Timestamp

  createdAt: Timestamp
  updatedAt: Timestamp
}


🔒 Não possui:

plano

wallet

dados de negócio

2️⃣ Workspace — Universo / Container / Franquia
export interface Workspace {
  id: ID

  name: string
  slug: string

  type: 'SINGLE_BUSINESS' | 'FRANCHISE'

  category: WorkspaceCategory
  status: 'ACTIVE' | 'SUSPENDED' | 'ARCHIVED'

  plan: WorkspacePlan
  planStartedAt: Timestamp
  planExpiresAt?: Timestamp

  settings: WorkspaceSettings

  createdAt: Timestamp
  updatedAt: Timestamp
}

export type WorkspaceCategory =
  | 'DELIVERY'
  | 'AUTONOMO'
  | 'COMERCIO'
  | 'LOJA'
  | 'SERVICOS'
  | 'LIVRE'

export type WorkspacePlan =
  | 'FREE'
  | 'PRO'
  | 'ENTERPRISE'

export interface WorkspaceSettings {
  allowMultipleEnterprises: boolean
  allowExtensions: boolean
  allowCustomThemes: boolean
  aiConsumptionEnabled: boolean

  limits: {
    maxUsers: number
    maxEnterprises: number
    maxProducts: number
  }
}


🧠 Workspace detém regras, limites, plano e expansão.

3️⃣ WorkspaceUser — Papel real no negócio
export interface WorkspaceUser {
  id: ID

  workspaceId: ID
  userId: ID

  role: WorkspaceRole
  permissions: string[]

  isActive: boolean

  joinedAt: Timestamp
  lastActionAt?: Timestamp
}

export type WorkspaceRole =
  | 'OWNER'
  | 'ADMIN'
  | 'MANAGER'
  | 'OPERATOR'
  | 'VIEWER'


✔️ Suporta:

PDV

equipes

franquias

permissões futuras

4️⃣ EnterpriseMother — Empresa / Loja / Unidade

Essa aqui é CRÍTICA.

export interface EnterpriseMother {
  id: ID

  workspaceId: ID

  type: 'AUTONOMO' | 'EMPRESA'

  legalName?: string
  tradeName: string

  document?: string
  documentType: 'CPF' | 'CNPJ' | 'NONE'

  segment: string
  subSegment?: string

  isMain: boolean // empresa mãe do workspace
  isActive: boolean

  contact: EnterpriseContact
  address?: EnterpriseAddress

  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface EnterpriseContact {
  email?: string
  phone?: string
  whatsapp?: string
}

export interface EnterpriseAddress {
  street?: string
  city?: string
  state?: string
  zipCode?: string
  country?: string
}


🧠 Cada loja/unidade é uma EnterpriseMother.

5️⃣ ThemeUIEnterpriseWorkspace — Design como dado
export interface ThemeUIEnterpriseWorkspace {
  id: ID

  workspaceId: ID
  enterpriseMotherId: ID

  themeType: 'SYSTEM' | 'TEMPLATE' | 'CUSTOM'

  themeName: string

  colors: ThemeColors
  typography: ThemeTypography
  layout: ThemeLayout

  darkModeEnabled: boolean

  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface ThemeLayout {
  density: 'COMPACT' | 'NORMAL' | 'COMFORT'
  borderRadius: number
  sidebarPosition: 'LEFT' | 'RIGHT'
}


✔️ Suporta:

compra de tema

troca por loja

layout por unidade

6️⃣ Feature — Capacidades do sistema
export interface Feature {
  id: ID

  code: string // SMART_SALES, AI_ANALYTICS
  name: string

  category: 'CORE' | 'AI' | 'AUTOMATION' | 'UI'

  description?: string

  requiresPlan?: WorkspacePlan

  isActive: boolean

  createdAt: Timestamp
}

7️⃣ WorkspaceFeature — Feature como estado
export interface WorkspaceFeature {
  id: ID

  workspaceId: ID
  featureId: ID

  source: 'PLAN' | 'STORE' | 'PROMOTION'

  enabled: boolean

  enabledAt?: Timestamp
  expiresAt?: Timestamp

  config: JSON

  createdAt: Timestamp
}


🧠 Feature ≠ Plano
Plano libera, feature ativa.

8️⃣ ComponentsEnterpriseWorkspace — UI moldável
export interface ComponentsEnterpriseWorkspace {
  id: ID

  workspaceId: ID
  enterpriseMotherId: ID

  layoutVersion: number

  components: UIComponentConfig[]

  updatedAt: Timestamp
}

export interface UIComponentConfig {
  key: string // DASHBOARD_SALES_OVERVIEW
  route: string

  visible: boolean
  order: number

  permissions?: string[]

  settings: JSON
}


✔️ Isso é o coração do sistema moldável.

9️⃣ Wallet — Economia do Workspace
export interface Wallet {
  id: ID

  workspaceId: ID

  balance: number
  reservedBalance: number

  currency: 'COIN'

  createdAt: Timestamp
  updatedAt: Timestamp
}

🔟 WalletTransaction — Tudo rastreável
export interface WalletTransaction {
  id: ID

  walletId: ID

  type: 'EARN' | 'SPEND' | 'RESERVE' | 'RELEASE'

  amount: number

  source:
    | 'ONBOARDING'
    | 'PLAN'
    | 'EXTENSION'
    | 'AI_USAGE'
    | 'PROMOTION'

  referenceId?: ID

  description?: string

  createdAt: Timestamp
}

🧠 Agora, validação brutal (importante)
Esse modelo:

aguenta franquia

aguenta múltiplas lojas

aguenta marketplace interno

aguenta IA com token

aguenta UI dinâmica

aguenta white-label

não trava Prisma

não depende de stack

Ele não é “cru”.
Ele é base séria de produto SaaS modular.