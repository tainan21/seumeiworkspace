/*
  Warnings:

  - You are about to drop the `EmailVerificationCode` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Session` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'BLOCKED', 'DELETED');

-- CreateEnum
CREATE TYPE "WorkspaceType" AS ENUM ('SINGLE_BUSINESS', 'FRANCHISE');

-- CreateEnum
CREATE TYPE "WorkspaceCategory" AS ENUM ('DELIVERY', 'AUTONOMO', 'COMERCIO', 'LOJA', 'SERVICOS', 'CONSTRUCAO', 'LIVRE');

-- CreateEnum
CREATE TYPE "WorkspaceStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "WorkspaceRole" AS ENUM ('OWNER', 'ADMIN', 'MANAGER', 'OPERATOR', 'VIEWER');

-- CreateEnum
CREATE TYPE "EnterpriseType" AS ENUM ('AUTONOMO', 'EMPRESA');

-- CreateEnum
CREATE TYPE "EnterpriseDocumentType" AS ENUM ('CPF', 'CNPJ', 'NONE');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'CANCELED', 'PAST_DUE', 'UNPAID', 'TRIALING');

-- CreateEnum
CREATE TYPE "BillingCycle" AS ENUM ('MONTHLY', 'YEARLY', 'LIFETIME');

-- CreateEnum
CREATE TYPE "WalletTransactionType" AS ENUM ('ONBOARDING_BONUS', 'PLAN_REWARD', 'PROMOTION', 'EXTENSION_PURCHASE', 'AI_CONSUMPTION', 'MANUAL_CREDIT', 'MANUAL_DEBIT');

-- CreateEnum
CREATE TYPE "FeatureCategory" AS ENUM ('CORE', 'AI', 'AUTOMATION', 'UI', 'INTEGRATION');

-- CreateEnum
CREATE TYPE "WorkspacePlan" AS ENUM ('FREE', 'PRO', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "FeatureSource" AS ENUM ('PLAN', 'STORE', 'PROMOTION', 'ONBOARDING');

-- CreateEnum
CREATE TYPE "ThemeUIType" AS ENUM ('SYSTEM', 'TEMPLATE', 'CUSTOM');

-- CreateEnum
CREATE TYPE "GlobalUserRole" AS ENUM ('ADMIN', 'SUPPORT', 'BILLING');

-- DropForeignKey
ALTER TABLE "EmailVerificationCode" DROP CONSTRAINT "EmailVerificationCode_userId_fkey";

-- DropForeignKey
ALTER TABLE "Project" DROP CONSTRAINT "Project_userId_fkey";

-- DropForeignKey
ALTER TABLE "Session" DROP CONSTRAINT "Session_userId_fkey";

-- DropTable
DROP TABLE "EmailVerificationCode";

-- DropTable
DROP TABLE "Session";

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerifiedAt" TIMESTAMP(3),
    "picture" TEXT,
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "lastLoginAt" TIMESTAMP(3),
    "stripe_customer_id" TEXT,
    "stripe_subscription_id" TEXT,
    "stripe_price_id" TEXT,
    "stripe_current_period_end" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_verification_codes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_verification_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workspaces" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "type" "WorkspaceType" NOT NULL DEFAULT 'SINGLE_BUSINESS',
    "category" "WorkspaceCategory" NOT NULL DEFAULT 'LIVRE',
    "status" "WorkspaceStatus" NOT NULL DEFAULT 'ACTIVE',
    "settings" JSONB NOT NULL DEFAULT '{}',
    "enterpriseMotherId" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workspaces_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workspace_members" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "WorkspaceRole" NOT NULL DEFAULT 'VIEWER',
    "permissions" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastActionAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workspace_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workspace_invites" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "WorkspaceRole" NOT NULL DEFAULT 'VIEWER',
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "workspace_invites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "enterprises" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "type" "EnterpriseType" NOT NULL,
    "legalName" TEXT,
    "tradeName" TEXT NOT NULL,
    "document" TEXT,
    "documentType" "EnterpriseDocumentType" NOT NULL DEFAULT 'NONE',
    "segment" TEXT NOT NULL,
    "subSegment" TEXT,
    "isMain" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "address" JSONB,
    "contact" JSONB NOT NULL,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "enterprises_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "currentPeriodStart" TIMESTAMP(3) NOT NULL,
    "currentPeriodEnd" TIMESTAMP(3) NOT NULL,
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "stripePriceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plans" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DECIMAL(15,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'BRL',
    "billingCycle" "BillingCycle" NOT NULL,
    "stripePriceId" TEXT,
    "features" JSONB NOT NULL DEFAULT '[]',
    "limits" JSONB NOT NULL DEFAULT '{}',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wallets" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "balance" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "reservedBalance" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'COIN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wallets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wallet_transactions" (
    "id" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "type" "WalletTransactionType" NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "description" TEXT NOT NULL,
    "referenceType" TEXT,
    "referenceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wallet_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "features" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "FeatureCategory" NOT NULL,
    "description" TEXT,
    "requiresPlan" "WorkspacePlan",
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "icon" TEXT,
    "version" TEXT NOT NULL DEFAULT '1.0.0',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "features_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workspace_features" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "featureId" TEXT NOT NULL,
    "source" "FeatureSource" NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "enabledAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "config" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workspace_features_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "theme_ui" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "enterpriseMotherId" TEXT NOT NULL,
    "themeType" "ThemeUIType" NOT NULL,
    "themeName" TEXT NOT NULL,
    "colors" JSONB NOT NULL,
    "typography" JSONB NOT NULL,
    "layout" JSONB NOT NULL,
    "darkModeEnabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "theme_ui_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "theme_presets" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" "WorkspaceCategory",
    "themeType" "ThemeUIType" NOT NULL,
    "colors" JSONB NOT NULL,
    "typography" JSONB NOT NULL,
    "layout" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "isPremium" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "theme_presets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "component_layouts" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "enterpriseMotherId" TEXT NOT NULL,
    "layoutVersion" INTEGER NOT NULL DEFAULT 1,
    "components" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "component_layouts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "global_users" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "GlobalUserRole" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "global_users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_stripe_customer_id_key" ON "users"("stripe_customer_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_stripe_subscription_id_key" ON "users"("stripe_subscription_id");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_status_idx" ON "users"("status");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_token_key" ON "sessions"("token");

-- CreateIndex
CREATE INDEX "sessions_userId_idx" ON "sessions"("userId");

-- CreateIndex
CREATE INDEX "sessions_token_idx" ON "sessions"("token");

-- CreateIndex
CREATE INDEX "sessions_expiresAt_idx" ON "sessions"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "email_verification_codes_code_key" ON "email_verification_codes"("code");

-- CreateIndex
CREATE INDEX "email_verification_codes_userId_idx" ON "email_verification_codes"("userId");

-- CreateIndex
CREATE INDEX "email_verification_codes_code_idx" ON "email_verification_codes"("code");

-- CreateIndex
CREATE INDEX "email_verification_codes_expiresAt_idx" ON "email_verification_codes"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "workspaces_slug_key" ON "workspaces"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "workspaces_enterpriseMotherId_key" ON "workspaces"("enterpriseMotherId");

-- CreateIndex
CREATE INDEX "workspaces_slug_idx" ON "workspaces"("slug");

-- CreateIndex
CREATE INDEX "workspaces_status_idx" ON "workspaces"("status");

-- CreateIndex
CREATE INDEX "workspaces_type_idx" ON "workspaces"("type");

-- CreateIndex
CREATE INDEX "workspaces_category_idx" ON "workspaces"("category");

-- CreateIndex
CREATE INDEX "workspace_members_workspaceId_idx" ON "workspace_members"("workspaceId");

-- CreateIndex
CREATE INDEX "workspace_members_userId_idx" ON "workspace_members"("userId");

-- CreateIndex
CREATE INDEX "workspace_members_role_idx" ON "workspace_members"("role");

-- CreateIndex
CREATE INDEX "workspace_members_isActive_idx" ON "workspace_members"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "workspace_members_workspaceId_userId_key" ON "workspace_members"("workspaceId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "workspace_invites_token_key" ON "workspace_invites"("token");

-- CreateIndex
CREATE INDEX "workspace_invites_workspaceId_idx" ON "workspace_invites"("workspaceId");

-- CreateIndex
CREATE INDEX "workspace_invites_token_idx" ON "workspace_invites"("token");

-- CreateIndex
CREATE INDEX "workspace_invites_expiresAt_idx" ON "workspace_invites"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "workspace_invites_workspaceId_email_key" ON "workspace_invites"("workspaceId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "enterprises_document_key" ON "enterprises"("document");

-- CreateIndex
CREATE INDEX "enterprises_workspaceId_idx" ON "enterprises"("workspaceId");

-- CreateIndex
CREATE INDEX "enterprises_document_idx" ON "enterprises"("document");

-- CreateIndex
CREATE INDEX "enterprises_type_idx" ON "enterprises"("type");

-- CreateIndex
CREATE INDEX "enterprises_isMain_idx" ON "enterprises"("isMain");

-- CreateIndex
CREATE INDEX "enterprises_isActive_idx" ON "enterprises"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_workspaceId_key" ON "subscriptions"("workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_stripeCustomerId_key" ON "subscriptions"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_stripeSubscriptionId_key" ON "subscriptions"("stripeSubscriptionId");

-- CreateIndex
CREATE INDEX "subscriptions_workspaceId_idx" ON "subscriptions"("workspaceId");

-- CreateIndex
CREATE INDEX "subscriptions_status_idx" ON "subscriptions"("status");

-- CreateIndex
CREATE INDEX "subscriptions_planId_idx" ON "subscriptions"("planId");

-- CreateIndex
CREATE UNIQUE INDEX "plans_code_key" ON "plans"("code");

-- CreateIndex
CREATE UNIQUE INDEX "plans_stripePriceId_key" ON "plans"("stripePriceId");

-- CreateIndex
CREATE INDEX "plans_code_idx" ON "plans"("code");

-- CreateIndex
CREATE INDEX "plans_isActive_idx" ON "plans"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "wallets_workspaceId_key" ON "wallets"("workspaceId");

-- CreateIndex
CREATE INDEX "wallets_workspaceId_idx" ON "wallets"("workspaceId");

-- CreateIndex
CREATE INDEX "wallet_transactions_walletId_idx" ON "wallet_transactions"("walletId");

-- CreateIndex
CREATE INDEX "wallet_transactions_type_idx" ON "wallet_transactions"("type");

-- CreateIndex
CREATE INDEX "wallet_transactions_createdAt_idx" ON "wallet_transactions"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "features_code_key" ON "features"("code");

-- CreateIndex
CREATE INDEX "features_code_idx" ON "features"("code");

-- CreateIndex
CREATE INDEX "features_category_idx" ON "features"("category");

-- CreateIndex
CREATE INDEX "features_isActive_idx" ON "features"("isActive");

-- CreateIndex
CREATE INDEX "workspace_features_workspaceId_idx" ON "workspace_features"("workspaceId");

-- CreateIndex
CREATE INDEX "workspace_features_enabled_idx" ON "workspace_features"("enabled");

-- CreateIndex
CREATE INDEX "workspace_features_expiresAt_idx" ON "workspace_features"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "workspace_features_workspaceId_featureId_key" ON "workspace_features"("workspaceId", "featureId");

-- CreateIndex
CREATE INDEX "theme_ui_workspaceId_idx" ON "theme_ui"("workspaceId");

-- CreateIndex
CREATE INDEX "theme_ui_enterpriseMotherId_idx" ON "theme_ui"("enterpriseMotherId");

-- CreateIndex
CREATE UNIQUE INDEX "theme_ui_workspaceId_enterpriseMotherId_key" ON "theme_ui"("workspaceId", "enterpriseMotherId");

-- CreateIndex
CREATE UNIQUE INDEX "theme_presets_code_key" ON "theme_presets"("code");

-- CreateIndex
CREATE INDEX "theme_presets_code_idx" ON "theme_presets"("code");

-- CreateIndex
CREATE INDEX "theme_presets_category_idx" ON "theme_presets"("category");

-- CreateIndex
CREATE INDEX "theme_presets_isActive_idx" ON "theme_presets"("isActive");

-- CreateIndex
CREATE INDEX "component_layouts_workspaceId_idx" ON "component_layouts"("workspaceId");

-- CreateIndex
CREATE INDEX "component_layouts_enterpriseMotherId_idx" ON "component_layouts"("enterpriseMotherId");

-- CreateIndex
CREATE UNIQUE INDEX "component_layouts_workspaceId_enterpriseMotherId_key" ON "component_layouts"("workspaceId", "enterpriseMotherId");

-- CreateIndex
CREATE UNIQUE INDEX "global_users_userId_key" ON "global_users"("userId");

-- CreateIndex
CREATE INDEX "global_users_userId_idx" ON "global_users"("userId");

-- CreateIndex
CREATE INDEX "global_users_role_idx" ON "global_users"("role");

-- CreateIndex
CREATE INDEX "global_users_isActive_idx" ON "global_users"("isActive");

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_verification_codes" ADD CONSTRAINT "email_verification_codes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workspaces" ADD CONSTRAINT "workspaces_enterpriseMotherId_fkey" FOREIGN KEY ("enterpriseMotherId") REFERENCES "enterprises"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workspace_members" ADD CONSTRAINT "workspace_members_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workspace_members" ADD CONSTRAINT "workspace_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workspace_invites" ADD CONSTRAINT "workspace_invites_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enterprises" ADD CONSTRAINT "enterprises_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_planId_fkey" FOREIGN KEY ("planId") REFERENCES "plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallets" ADD CONSTRAINT "wallets_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallet_transactions" ADD CONSTRAINT "wallet_transactions_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "wallets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workspace_features" ADD CONSTRAINT "workspace_features_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workspace_features" ADD CONSTRAINT "workspace_features_featureId_fkey" FOREIGN KEY ("featureId") REFERENCES "features"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "theme_ui" ADD CONSTRAINT "theme_ui_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "theme_ui" ADD CONSTRAINT "theme_ui_enterpriseMotherId_fkey" FOREIGN KEY ("enterpriseMotherId") REFERENCES "enterprises"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "component_layouts" ADD CONSTRAINT "component_layouts_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "component_layouts" ADD CONSTRAINT "component_layouts_enterpriseMotherId_fkey" FOREIGN KEY ("enterpriseMotherId") REFERENCES "enterprises"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "global_users" ADD CONSTRAINT "global_users_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
