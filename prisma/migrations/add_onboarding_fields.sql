-- ============================================
-- Migration: Add Onboarding Fields
-- Adiciona campos e models necessários para onboarding
-- ============================================

-- Adicionar enums
CREATE TYPE "ThemeStyle" AS ENUM ('minimal', 'corporate', 'playful');
CREATE TYPE "TopBarVariant" AS ENUM ('barTop_A', 'barTop_B', 'barTop_C');
CREATE TYPE "BillingPlan" AS ENUM ('free', 'pro', 'enterprise');
CREATE TYPE "IdentifierType" AS ENUM ('CNPJ', 'CPF');
CREATE TYPE "CompanyType" AS ENUM ('MEI', 'Simples', 'EIRELI', 'Ltda', 'SA', 'Startup');

-- Adicionar campos ao Workspace
ALTER TABLE "workspaces" 
  ADD COLUMN IF NOT EXISTS "theme" "ThemeStyle" DEFAULT 'minimal',
  ADD COLUMN IF NOT EXISTS "topBarVariant" "TopBarVariant" DEFAULT 'barTop_A',
  ADD COLUMN IF NOT EXISTS "billingPlan" "BillingPlan" DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS "locale" TEXT DEFAULT 'pt-BR',
  ADD COLUMN IF NOT EXISTS "timezone" TEXT DEFAULT 'America/Sao_Paulo';

-- Criar tabela WorkspaceBrand
CREATE TABLE IF NOT EXISTS "workspace_brands" (
  "id" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "logoUrl" TEXT,
  "primaryColor" TEXT NOT NULL DEFAULT '#18181B',
  "accentColor" TEXT NOT NULL DEFAULT '#3B82F6',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "workspace_brands_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "workspace_brands_workspaceId_key" ON "workspace_brands"("workspaceId");
CREATE INDEX IF NOT EXISTS "workspace_brands_workspaceId_idx" ON "workspace_brands"("workspaceId");

-- Criar tabela WorkspaceCompany
CREATE TABLE IF NOT EXISTS "workspace_companies" (
  "id" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "identifierType" "IdentifierType",
  "identifierValue" TEXT,
  "companyType" "CompanyType",
  "employeeCount" INTEGER,
  "revenueRange" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "workspace_companies_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "workspace_companies_workspaceId_key" ON "workspace_companies"("workspaceId");
CREATE INDEX IF NOT EXISTS "workspace_companies_workspaceId_idx" ON "workspace_companies"("workspaceId");

-- Criar tabela WorkspaceApp
CREATE TABLE IF NOT EXISTS "workspace_apps" (
  "id" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "appId" TEXT NOT NULL,
  "isEnabled" BOOLEAN NOT NULL DEFAULT true,
  "installedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "workspace_apps_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "workspace_apps_workspaceId_appId_key" ON "workspace_apps"("workspaceId", "appId");
CREATE INDEX IF NOT EXISTS "workspace_apps_workspaceId_idx" ON "workspace_apps"("workspaceId");
CREATE INDEX IF NOT EXISTS "workspace_apps_appId_idx" ON "workspace_apps"("appId");

-- Criar tabela MenuItem
CREATE TABLE IF NOT EXISTS "menu_items" (
  "id" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "itemId" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "icon" TEXT NOT NULL,
  "route" TEXT NOT NULL,
  "parentId" TEXT,
  "orderIndex" INTEGER NOT NULL DEFAULT 0,
  "isVisible" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "menu_items_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "menu_items_workspaceId_orderIndex_idx" ON "menu_items"("workspaceId", "orderIndex");
CREATE INDEX IF NOT EXISTS "menu_items_parentId_idx" ON "menu_items"("parentId");

-- Adicionar foreign keys
ALTER TABLE "workspace_brands" 
  ADD CONSTRAINT "workspace_brands_workspaceId_fkey" 
  FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "workspace_companies" 
  ADD CONSTRAINT "workspace_companies_workspaceId_fkey" 
  FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "workspace_apps" 
  ADD CONSTRAINT "workspace_apps_workspaceId_fkey" 
  FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "menu_items" 
  ADD CONSTRAINT "menu_items_workspaceId_fkey" 
  FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "menu_items" 
  ADD CONSTRAINT "menu_items_parentId_fkey" 
  FOREIGN KEY ("parentId") REFERENCES "menu_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;
