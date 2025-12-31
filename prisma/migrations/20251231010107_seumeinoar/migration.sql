/*
  Warnings:

  - You are about to drop the `Project` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[githubId]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `workspace_invites` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "CustomerDocumentType" AS ENUM ('CPF', 'CNPJ');

-- CreateEnum
CREATE TYPE "CustomerStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'BLOCKED');

-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PARTIAL', 'PAID', 'REFUNDED', 'FAILED');

-- CreateEnum
CREATE TYPE "QuoteStatus" AS ENUM ('DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'CONVERTED');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('DRAFT', 'ISSUED', 'PARTIAL', 'PAID', 'OVERDUE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('INCOME', 'EXPENSE', 'TRANSFER');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'CREDIT_CARD', 'DEBIT_CARD', 'PIX', 'BANK_TRANSFER', 'DAS', 'OTHER');

-- CreateEnum
CREATE TYPE "BankAccountType" AS ENUM ('CHECKING', 'SAVINGS');

-- CreateEnum
CREATE TYPE "BankTransactionType" AS ENUM ('DEBIT', 'CREDIT');

-- CreateEnum
CREATE TYPE "PixKeyType" AS ENUM ('CPF', 'CNPJ', 'EMAIL', 'PHONE', 'RANDOM');

-- CreateEnum
CREATE TYPE "PixPaymentStatus" AS ENUM ('PENDING', 'CREATED', 'PROCESSING', 'COMPLETED', 'EXPIRED', 'CANCELLED', 'FAILED');

-- CreateEnum
CREATE TYPE "DasPaymentStatus" AS ENUM ('PENDING', 'PAID', 'OVERDUE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentLinkStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'EXPIRED');

-- CreateEnum
CREATE TYPE "SplitRecipientType" AS ENUM ('PIX_KEY', 'BANK_ACCOUNT', 'EXTERNAL_ID');

-- CreateEnum
CREATE TYPE "SplitAllocationType" AS ENUM ('PERCENTAGE', 'FIXED');

-- CreateEnum
CREATE TYPE "VirtualAccountStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "ModuleCategory" AS ENUM ('SALES', 'INVENTORY', 'FINANCE', 'CRM', 'ACCOUNTING', 'REPORTS', 'INTEGRATIONS', 'OTHER');

-- CreateEnum
CREATE TYPE "DunningJobStatus" AS ENUM ('PENDING', 'SCHEDULED', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "DunningLogStatus" AS ENUM ('PENDING', 'SENT', 'DELIVERED', 'FAILED', 'BOUNCED');

-- CreateEnum
CREATE TYPE "DunningAction" AS ENUM ('EMAIL', 'SMS', 'WHATSAPP', 'NOTIFICATION');

-- CreateEnum
CREATE TYPE "MessageTemplateType" AS ENUM ('EMAIL', 'SMS', 'WHATSAPP', 'NOTIFICATION', 'INVOICE', 'ORDER', 'QUOTE');

-- CreateEnum
CREATE TYPE "AvisoType" AS ENUM ('INFO', 'WARNING', 'ERROR', 'SUCCESS');

-- CreateEnum
CREATE TYPE "PipelineEventStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- DropForeignKey
ALTER TABLE "Project" DROP CONSTRAINT "Project_userId_fkey";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "avatarUrl" TEXT,
ADD COLUMN     "githubId" INTEGER;

-- AlterTable
ALTER TABLE "workspace_invites" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- DropTable
DROP TABLE "Project";

-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analytics_events" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "userId" TEXT,
    "eventType" TEXT NOT NULL,
    "entityType" TEXT,
    "entityId" TEXT,
    "properties" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analytics_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analytics_metrics" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "metricType" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "periodDate" TIMESTAMP(3) NOT NULL,
    "value" DECIMAL(15,2) NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analytics_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "onboarding_flows" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "steps" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "onboarding_flows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "onboarding_completions" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "flowId" TEXT NOT NULL,
    "currentStep" INTEGER NOT NULL DEFAULT 0,
    "completedSteps" JSONB NOT NULL DEFAULT '[]',
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "onboarding_completions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "onboarding_templates" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" "WorkspaceCategory",
    "steps" JSONB NOT NULL,
    "config" JSONB NOT NULL DEFAULT '{}',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "onboarding_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_permissions" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "permissions" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "module_permissions" (
    "id" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "roleId" TEXT,
    "permission" TEXT NOT NULL,
    "granted" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "module_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT,
    "userId" TEXT,
    "userEmail" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "changes" JSONB,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customers" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "enterpriseId" TEXT,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "document" TEXT,
    "documentType" "CustomerDocumentType",
    "address" JSONB,
    "status" "CustomerStatus" NOT NULL DEFAULT 'ACTIVE',
    "tags" TEXT[],
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "enterpriseId" TEXT,
    "name" TEXT NOT NULL,
    "sku" TEXT,
    "barcode" TEXT,
    "categoryId" TEXT,
    "price" DECIMAL(15,2) NOT NULL,
    "costPrice" DECIMAL(15,2),
    "trackStock" BOOLEAN NOT NULL DEFAULT false,
    "stockQuantity" DECIMAL(15,2),
    "description" TEXT,
    "images" TEXT[],
    "status" "ProductStatus" NOT NULL DEFAULT 'ACTIVE',
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_categories" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "enterpriseId" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "customerId" TEXT,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "subtotal" DECIMAL(15,2) NOT NULL,
    "discount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "tax" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(15,2) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_items" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "productId" TEXT,
    "name" TEXT NOT NULL,
    "quantity" DECIMAL(15,2) NOT NULL,
    "unitPrice" DECIMAL(15,2) NOT NULL,
    "discount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(15,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quotes" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "enterpriseId" TEXT NOT NULL,
    "quoteNumber" TEXT NOT NULL,
    "customerId" TEXT,
    "status" "QuoteStatus" NOT NULL DEFAULT 'DRAFT',
    "subtotal" DECIMAL(15,2) NOT NULL,
    "discount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "tax" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(15,2) NOT NULL,
    "validUntil" TIMESTAMP(3),
    "convertedToOrderId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quotes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quote_items" (
    "id" TEXT NOT NULL,
    "quoteId" TEXT NOT NULL,
    "productId" TEXT,
    "name" TEXT NOT NULL,
    "quantity" DECIMAL(15,2) NOT NULL,
    "unitPrice" DECIMAL(15,2) NOT NULL,
    "discount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(15,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quote_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoices" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "enterpriseId" TEXT NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
    "customerId" TEXT,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'DRAFT',
    "subtotal" DECIMAL(15,2) NOT NULL,
    "discount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "tax" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(15,2) NOT NULL,
    "paidAmount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "issuedAt" TIMESTAMP(3) NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoice_items" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "productId" TEXT,
    "name" TEXT NOT NULL,
    "quantity" DECIMAL(15,2) NOT NULL,
    "unitPrice" DECIMAL(15,2) NOT NULL,
    "discount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(15,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invoice_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "enterpriseId" TEXT,
    "invoiceId" TEXT,
    "type" "TransactionType" NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "paymentMethod" "PaymentMethod" NOT NULL,
    "status" "TransactionStatus" NOT NULL DEFAULT 'PENDING',
    "processedAt" TIMESTAMP(3),
    "description" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bank_accounts" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "enterpriseId" TEXT NOT NULL,
    "bankCode" TEXT NOT NULL,
    "bankName" TEXT NOT NULL,
    "agency" TEXT NOT NULL,
    "account" TEXT NOT NULL,
    "accountDigit" TEXT NOT NULL,
    "accountType" "BankAccountType" NOT NULL,
    "holderName" TEXT NOT NULL,
    "holderDocument" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bank_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bank_transactions" (
    "id" TEXT NOT NULL,
    "bankAccountId" TEXT NOT NULL,
    "type" "BankTransactionType" NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "description" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "postedAt" TIMESTAMP(3),
    "balance" DECIMAL(15,2),
    "externalId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bank_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pix_keys" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "enterpriseId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "keyType" "PixKeyType" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pix_keys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pix_payments" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "enterpriseId" TEXT,
    "pixKeyId" TEXT,
    "amount" DECIMAL(15,2) NOT NULL,
    "description" TEXT,
    "qrCode" TEXT,
    "qrCodeImage" TEXT,
    "status" "PixPaymentStatus" NOT NULL DEFAULT 'PENDING',
    "endToEndId" TEXT,
    "txId" TEXT,
    "expiresAt" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pix_payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "das_payments" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "enterpriseId" TEXT NOT NULL,
    "referenceNumber" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "principal" DECIMAL(15,2) NOT NULL,
    "interest" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "fine" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "status" "DasPaymentStatus" NOT NULL DEFAULT 'PENDING',
    "dueDate" TIMESTAMP(3) NOT NULL,
    "paidAt" TIMESTAMP(3),
    "barcode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "das_payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_links" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "enterpriseId" TEXT,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "amount" DECIMAL(15,2),
    "allowCustomAmount" BOOLEAN NOT NULL DEFAULT false,
    "paymentMethods" JSONB NOT NULL DEFAULT '[]',
    "maxUses" INTEGER,
    "expiresAt" TIMESTAMP(3),
    "status" "PaymentLinkStatus" NOT NULL DEFAULT 'ACTIVE',
    "usesCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "split_rules" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "enterpriseId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "conditions" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "split_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "split_allocations" (
    "id" TEXT NOT NULL,
    "ruleId" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "recipientType" "SplitRecipientType" NOT NULL,
    "allocationType" "SplitAllocationType" NOT NULL,
    "percentage" DECIMAL(5,2),
    "fixedAmount" DECIMAL(15,2),
    "priority" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "split_allocations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "virtual_accounts" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "enterpriseId" TEXT,
    "accountId" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "bankCode" TEXT NOT NULL,
    "bankName" TEXT NOT NULL,
    "status" "VirtualAccountStatus" NOT NULL DEFAULT 'ACTIVE',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "virtual_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "modules" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" "ModuleCategory" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isCore" BOOLEAN NOT NULL DEFAULT false,
    "icon" TEXT,
    "version" TEXT NOT NULL DEFAULT '1.0.0',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "modules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "module_configs" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "config" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "module_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mei_profiles" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "enterpriseId" TEXT NOT NULL,
    "cnpj" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "mainActivity" TEXT NOT NULL,
    "activities" TEXT[],
    "address" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mei_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dunning_policies" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "maxAttempts" INTEGER NOT NULL DEFAULT 3,
    "intervalDays" INTEGER NOT NULL DEFAULT 7,
    "actions" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dunning_policies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dunning_jobs" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "policyId" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "status" "DunningJobStatus" NOT NULL DEFAULT 'PENDING',
    "attemptNumber" INTEGER NOT NULL,
    "maxAttempts" INTEGER NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "executedAt" TIMESTAMP(3),
    "nextAttemptAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dunning_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dunning_logs" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "action" "DunningAction" NOT NULL,
    "status" "DunningLogStatus" NOT NULL DEFAULT 'PENDING',
    "success" BOOLEAN NOT NULL,
    "errorMessage" TEXT,
    "metadata" JSONB,
    "executedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dunning_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "message_templates" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" "MessageTemplateType" NOT NULL,
    "subject" TEXT,
    "body" TEXT NOT NULL,
    "channels" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "message_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avisos" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT,
    "userId" TEXT,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" "AvisoType" NOT NULL DEFAULT 'INFO',
    "actionLabel" TEXT,
    "actionUrl" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "avisos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feature_flag_overrides" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT,
    "featureCode" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "reason" TEXT,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "feature_flag_overrides_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_dashboard_settings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "layout" JSONB NOT NULL,
    "defaultFilters" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_dashboard_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pipeline_events" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "entityType" TEXT,
    "entityId" TEXT,
    "payload" JSONB NOT NULL,
    "status" "PipelineEventStatus" NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "processedAt" TIMESTAMP(3),
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pipeline_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "projects_userId_idx" ON "projects"("userId");

-- CreateIndex
CREATE INDEX "analytics_events_workspaceId_idx" ON "analytics_events"("workspaceId");

-- CreateIndex
CREATE INDEX "analytics_events_eventType_idx" ON "analytics_events"("eventType");

-- CreateIndex
CREATE INDEX "analytics_events_createdAt_idx" ON "analytics_events"("createdAt");

-- CreateIndex
CREATE INDEX "analytics_metrics_workspaceId_idx" ON "analytics_metrics"("workspaceId");

-- CreateIndex
CREATE INDEX "analytics_metrics_metricType_idx" ON "analytics_metrics"("metricType");

-- CreateIndex
CREATE INDEX "analytics_metrics_periodDate_idx" ON "analytics_metrics"("periodDate");

-- CreateIndex
CREATE UNIQUE INDEX "analytics_metrics_workspaceId_metricType_period_periodDate_key" ON "analytics_metrics"("workspaceId", "metricType", "period", "periodDate");

-- CreateIndex
CREATE UNIQUE INDEX "onboarding_flows_code_key" ON "onboarding_flows"("code");

-- CreateIndex
CREATE INDEX "onboarding_flows_code_idx" ON "onboarding_flows"("code");

-- CreateIndex
CREATE INDEX "onboarding_flows_isActive_idx" ON "onboarding_flows"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "onboarding_completions_workspaceId_key" ON "onboarding_completions"("workspaceId");

-- CreateIndex
CREATE INDEX "onboarding_completions_workspaceId_idx" ON "onboarding_completions"("workspaceId");

-- CreateIndex
CREATE INDEX "onboarding_completions_flowId_idx" ON "onboarding_completions"("flowId");

-- CreateIndex
CREATE INDEX "onboarding_completions_isCompleted_idx" ON "onboarding_completions"("isCompleted");

-- CreateIndex
CREATE UNIQUE INDEX "onboarding_templates_code_key" ON "onboarding_templates"("code");

-- CreateIndex
CREATE INDEX "onboarding_templates_code_idx" ON "onboarding_templates"("code");

-- CreateIndex
CREATE INDEX "onboarding_templates_category_idx" ON "onboarding_templates"("category");

-- CreateIndex
CREATE INDEX "onboarding_templates_isActive_idx" ON "onboarding_templates"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "role_permissions_code_key" ON "role_permissions"("code");

-- CreateIndex
CREATE INDEX "role_permissions_workspaceId_idx" ON "role_permissions"("workspaceId");

-- CreateIndex
CREATE INDEX "role_permissions_code_idx" ON "role_permissions"("code");

-- CreateIndex
CREATE INDEX "module_permissions_moduleId_idx" ON "module_permissions"("moduleId");

-- CreateIndex
CREATE INDEX "module_permissions_roleId_idx" ON "module_permissions"("roleId");

-- CreateIndex
CREATE UNIQUE INDEX "module_permissions_moduleId_roleId_permission_key" ON "module_permissions"("moduleId", "roleId", "permission");

-- CreateIndex
CREATE INDEX "audit_logs_workspaceId_idx" ON "audit_logs"("workspaceId");

-- CreateIndex
CREATE INDEX "audit_logs_userId_idx" ON "audit_logs"("userId");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- CreateIndex
CREATE INDEX "audit_logs_entityType_idx" ON "audit_logs"("entityType");

-- CreateIndex
CREATE INDEX "audit_logs_entityId_idx" ON "audit_logs"("entityId");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "customers_document_key" ON "customers"("document");

-- CreateIndex
CREATE INDEX "customers_workspaceId_idx" ON "customers"("workspaceId");

-- CreateIndex
CREATE INDEX "customers_enterpriseId_idx" ON "customers"("enterpriseId");

-- CreateIndex
CREATE INDEX "customers_document_idx" ON "customers"("document");

-- CreateIndex
CREATE INDEX "customers_status_idx" ON "customers"("status");

-- CreateIndex
CREATE UNIQUE INDEX "products_sku_key" ON "products"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "products_barcode_key" ON "products"("barcode");

-- CreateIndex
CREATE INDEX "products_workspaceId_idx" ON "products"("workspaceId");

-- CreateIndex
CREATE INDEX "products_enterpriseId_idx" ON "products"("enterpriseId");

-- CreateIndex
CREATE INDEX "products_categoryId_idx" ON "products"("categoryId");

-- CreateIndex
CREATE INDEX "products_sku_idx" ON "products"("sku");

-- CreateIndex
CREATE INDEX "products_status_idx" ON "products"("status");

-- CreateIndex
CREATE INDEX "product_categories_workspaceId_idx" ON "product_categories"("workspaceId");

-- CreateIndex
CREATE INDEX "product_categories_parentId_idx" ON "product_categories"("parentId");

-- CreateIndex
CREATE UNIQUE INDEX "orders_orderNumber_key" ON "orders"("orderNumber");

-- CreateIndex
CREATE INDEX "orders_workspaceId_idx" ON "orders"("workspaceId");

-- CreateIndex
CREATE INDEX "orders_enterpriseId_idx" ON "orders"("enterpriseId");

-- CreateIndex
CREATE INDEX "orders_customerId_idx" ON "orders"("customerId");

-- CreateIndex
CREATE INDEX "orders_status_idx" ON "orders"("status");

-- CreateIndex
CREATE INDEX "orders_orderNumber_idx" ON "orders"("orderNumber");

-- CreateIndex
CREATE INDEX "order_items_orderId_idx" ON "order_items"("orderId");

-- CreateIndex
CREATE INDEX "order_items_productId_idx" ON "order_items"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "quotes_quoteNumber_key" ON "quotes"("quoteNumber");

-- CreateIndex
CREATE UNIQUE INDEX "quotes_convertedToOrderId_key" ON "quotes"("convertedToOrderId");

-- CreateIndex
CREATE INDEX "quotes_workspaceId_idx" ON "quotes"("workspaceId");

-- CreateIndex
CREATE INDEX "quotes_enterpriseId_idx" ON "quotes"("enterpriseId");

-- CreateIndex
CREATE INDEX "quotes_customerId_idx" ON "quotes"("customerId");

-- CreateIndex
CREATE INDEX "quotes_status_idx" ON "quotes"("status");

-- CreateIndex
CREATE INDEX "quote_items_quoteId_idx" ON "quote_items"("quoteId");

-- CreateIndex
CREATE INDEX "quote_items_productId_idx" ON "quote_items"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_invoiceNumber_key" ON "invoices"("invoiceNumber");

-- CreateIndex
CREATE INDEX "invoices_workspaceId_idx" ON "invoices"("workspaceId");

-- CreateIndex
CREATE INDEX "invoices_enterpriseId_idx" ON "invoices"("enterpriseId");

-- CreateIndex
CREATE INDEX "invoices_customerId_idx" ON "invoices"("customerId");

-- CreateIndex
CREATE INDEX "invoices_status_idx" ON "invoices"("status");

-- CreateIndex
CREATE INDEX "invoices_invoiceNumber_idx" ON "invoices"("invoiceNumber");

-- CreateIndex
CREATE INDEX "invoices_dueDate_idx" ON "invoices"("dueDate");

-- CreateIndex
CREATE INDEX "invoice_items_invoiceId_idx" ON "invoice_items"("invoiceId");

-- CreateIndex
CREATE INDEX "invoice_items_productId_idx" ON "invoice_items"("productId");

-- CreateIndex
CREATE INDEX "transactions_workspaceId_idx" ON "transactions"("workspaceId");

-- CreateIndex
CREATE INDEX "transactions_enterpriseId_idx" ON "transactions"("enterpriseId");

-- CreateIndex
CREATE INDEX "transactions_invoiceId_idx" ON "transactions"("invoiceId");

-- CreateIndex
CREATE INDEX "transactions_type_idx" ON "transactions"("type");

-- CreateIndex
CREATE INDEX "transactions_status_idx" ON "transactions"("status");

-- CreateIndex
CREATE INDEX "transactions_paymentMethod_idx" ON "transactions"("paymentMethod");

-- CreateIndex
CREATE INDEX "bank_accounts_workspaceId_idx" ON "bank_accounts"("workspaceId");

-- CreateIndex
CREATE INDEX "bank_accounts_enterpriseId_idx" ON "bank_accounts"("enterpriseId");

-- CreateIndex
CREATE INDEX "bank_accounts_isActive_idx" ON "bank_accounts"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "bank_transactions_externalId_key" ON "bank_transactions"("externalId");

-- CreateIndex
CREATE INDEX "bank_transactions_bankAccountId_idx" ON "bank_transactions"("bankAccountId");

-- CreateIndex
CREATE INDEX "bank_transactions_type_idx" ON "bank_transactions"("type");

-- CreateIndex
CREATE INDEX "bank_transactions_date_idx" ON "bank_transactions"("date");

-- CreateIndex
CREATE INDEX "bank_transactions_externalId_idx" ON "bank_transactions"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "pix_keys_key_key" ON "pix_keys"("key");

-- CreateIndex
CREATE INDEX "pix_keys_workspaceId_idx" ON "pix_keys"("workspaceId");

-- CreateIndex
CREATE INDEX "pix_keys_enterpriseId_idx" ON "pix_keys"("enterpriseId");

-- CreateIndex
CREATE INDEX "pix_keys_key_idx" ON "pix_keys"("key");

-- CreateIndex
CREATE UNIQUE INDEX "pix_payments_endToEndId_key" ON "pix_payments"("endToEndId");

-- CreateIndex
CREATE UNIQUE INDEX "pix_payments_txId_key" ON "pix_payments"("txId");

-- CreateIndex
CREATE INDEX "pix_payments_workspaceId_idx" ON "pix_payments"("workspaceId");

-- CreateIndex
CREATE INDEX "pix_payments_pixKeyId_idx" ON "pix_payments"("pixKeyId");

-- CreateIndex
CREATE INDEX "pix_payments_status_idx" ON "pix_payments"("status");

-- CreateIndex
CREATE INDEX "pix_payments_endToEndId_idx" ON "pix_payments"("endToEndId");

-- CreateIndex
CREATE UNIQUE INDEX "das_payments_referenceNumber_key" ON "das_payments"("referenceNumber");

-- CreateIndex
CREATE INDEX "das_payments_workspaceId_idx" ON "das_payments"("workspaceId");

-- CreateIndex
CREATE INDEX "das_payments_enterpriseId_idx" ON "das_payments"("enterpriseId");

-- CreateIndex
CREATE INDEX "das_payments_referenceNumber_idx" ON "das_payments"("referenceNumber");

-- CreateIndex
CREATE INDEX "das_payments_status_idx" ON "das_payments"("status");

-- CreateIndex
CREATE INDEX "das_payments_dueDate_idx" ON "das_payments"("dueDate");

-- CreateIndex
CREATE UNIQUE INDEX "payment_links_code_key" ON "payment_links"("code");

-- CreateIndex
CREATE INDEX "payment_links_workspaceId_idx" ON "payment_links"("workspaceId");

-- CreateIndex
CREATE INDEX "payment_links_code_idx" ON "payment_links"("code");

-- CreateIndex
CREATE INDEX "payment_links_status_idx" ON "payment_links"("status");

-- CreateIndex
CREATE INDEX "split_rules_workspaceId_idx" ON "split_rules"("workspaceId");

-- CreateIndex
CREATE INDEX "split_rules_enterpriseId_idx" ON "split_rules"("enterpriseId");

-- CreateIndex
CREATE INDEX "split_rules_isActive_idx" ON "split_rules"("isActive");

-- CreateIndex
CREATE INDEX "split_allocations_ruleId_idx" ON "split_allocations"("ruleId");

-- CreateIndex
CREATE INDEX "split_allocations_priority_idx" ON "split_allocations"("priority");

-- CreateIndex
CREATE UNIQUE INDEX "virtual_accounts_accountId_key" ON "virtual_accounts"("accountId");

-- CreateIndex
CREATE UNIQUE INDEX "virtual_accounts_accountNumber_key" ON "virtual_accounts"("accountNumber");

-- CreateIndex
CREATE INDEX "virtual_accounts_workspaceId_idx" ON "virtual_accounts"("workspaceId");

-- CreateIndex
CREATE INDEX "virtual_accounts_enterpriseId_idx" ON "virtual_accounts"("enterpriseId");

-- CreateIndex
CREATE INDEX "virtual_accounts_accountId_idx" ON "virtual_accounts"("accountId");

-- CreateIndex
CREATE INDEX "virtual_accounts_status_idx" ON "virtual_accounts"("status");

-- CreateIndex
CREATE UNIQUE INDEX "modules_code_key" ON "modules"("code");

-- CreateIndex
CREATE INDEX "modules_code_idx" ON "modules"("code");

-- CreateIndex
CREATE INDEX "modules_category_idx" ON "modules"("category");

-- CreateIndex
CREATE INDEX "modules_isActive_idx" ON "modules"("isActive");

-- CreateIndex
CREATE INDEX "module_configs_workspaceId_idx" ON "module_configs"("workspaceId");

-- CreateIndex
CREATE INDEX "module_configs_moduleId_idx" ON "module_configs"("moduleId");

-- CreateIndex
CREATE UNIQUE INDEX "module_configs_workspaceId_moduleId_key" ON "module_configs"("workspaceId", "moduleId");

-- CreateIndex
CREATE UNIQUE INDEX "mei_profiles_cnpj_key" ON "mei_profiles"("cnpj");

-- CreateIndex
CREATE INDEX "mei_profiles_workspaceId_idx" ON "mei_profiles"("workspaceId");

-- CreateIndex
CREATE INDEX "mei_profiles_enterpriseId_idx" ON "mei_profiles"("enterpriseId");

-- CreateIndex
CREATE INDEX "mei_profiles_cnpj_idx" ON "mei_profiles"("cnpj");

-- CreateIndex
CREATE INDEX "dunning_policies_workspaceId_idx" ON "dunning_policies"("workspaceId");

-- CreateIndex
CREATE INDEX "dunning_policies_isActive_idx" ON "dunning_policies"("isActive");

-- CreateIndex
CREATE INDEX "dunning_jobs_workspaceId_idx" ON "dunning_jobs"("workspaceId");

-- CreateIndex
CREATE INDEX "dunning_jobs_policyId_idx" ON "dunning_jobs"("policyId");

-- CreateIndex
CREATE INDEX "dunning_jobs_invoiceId_idx" ON "dunning_jobs"("invoiceId");

-- CreateIndex
CREATE INDEX "dunning_jobs_status_idx" ON "dunning_jobs"("status");

-- CreateIndex
CREATE INDEX "dunning_jobs_scheduledAt_idx" ON "dunning_jobs"("scheduledAt");

-- CreateIndex
CREATE INDEX "dunning_logs_jobId_idx" ON "dunning_logs"("jobId");

-- CreateIndex
CREATE INDEX "dunning_logs_status_idx" ON "dunning_logs"("status");

-- CreateIndex
CREATE INDEX "dunning_logs_executedAt_idx" ON "dunning_logs"("executedAt");

-- CreateIndex
CREATE INDEX "message_templates_workspaceId_idx" ON "message_templates"("workspaceId");

-- CreateIndex
CREATE INDEX "message_templates_code_idx" ON "message_templates"("code");

-- CreateIndex
CREATE INDEX "message_templates_type_idx" ON "message_templates"("type");

-- CreateIndex
CREATE UNIQUE INDEX "message_templates_workspaceId_code_key" ON "message_templates"("workspaceId", "code");

-- CreateIndex
CREATE INDEX "avisos_workspaceId_idx" ON "avisos"("workspaceId");

-- CreateIndex
CREATE INDEX "avisos_userId_idx" ON "avisos"("userId");

-- CreateIndex
CREATE INDEX "avisos_isRead_idx" ON "avisos"("isRead");

-- CreateIndex
CREATE INDEX "avisos_expiresAt_idx" ON "avisos"("expiresAt");

-- CreateIndex
CREATE INDEX "feature_flag_overrides_workspaceId_idx" ON "feature_flag_overrides"("workspaceId");

-- CreateIndex
CREATE INDEX "feature_flag_overrides_featureCode_idx" ON "feature_flag_overrides"("featureCode");

-- CreateIndex
CREATE INDEX "feature_flag_overrides_enabled_idx" ON "feature_flag_overrides"("enabled");

-- CreateIndex
CREATE UNIQUE INDEX "feature_flag_overrides_workspaceId_featureCode_key" ON "feature_flag_overrides"("workspaceId", "featureCode");

-- CreateIndex
CREATE UNIQUE INDEX "user_dashboard_settings_userId_key" ON "user_dashboard_settings"("userId");

-- CreateIndex
CREATE INDEX "user_dashboard_settings_userId_idx" ON "user_dashboard_settings"("userId");

-- CreateIndex
CREATE INDEX "user_dashboard_settings_workspaceId_idx" ON "user_dashboard_settings"("workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "user_dashboard_settings_userId_workspaceId_key" ON "user_dashboard_settings"("userId", "workspaceId");

-- CreateIndex
CREATE INDEX "pipeline_events_workspaceId_idx" ON "pipeline_events"("workspaceId");

-- CreateIndex
CREATE INDEX "pipeline_events_status_idx" ON "pipeline_events"("status");

-- CreateIndex
CREATE INDEX "pipeline_events_eventType_idx" ON "pipeline_events"("eventType");

-- CreateIndex
CREATE UNIQUE INDEX "users_githubId_key" ON "users"("githubId");

-- CreateIndex
CREATE INDEX "workspace_features_featureId_idx" ON "workspace_features"("featureId");

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
