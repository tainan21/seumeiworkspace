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