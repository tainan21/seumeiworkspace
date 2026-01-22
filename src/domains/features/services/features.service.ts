"use server";

import { prisma } from "~/lib/server/db";
import type { Feature, WorkspaceFeature, Prisma } from "@prisma/client";
import { FeatureSource, FeatureCategory } from "@prisma/client";
import * as WalletService from "~/domains/workspace/services/wallet.service";
// TODO: Importar BillingService quando estiver implementado
// import { BillingService } from "~/domains/billing/services/billing.service";

/**
 * Verifica se uma feature está ativa no workspace
 */
export async function isFeatureEnabled(
  workspaceId: string,
  featureCode: string
): Promise<boolean> {
  if (!workspaceId?.trim() || !featureCode?.trim()) {
    return false;
  }

  const workspaceFeature = await prisma.workspaceFeature.findFirst({
    where: {
      workspaceId,
      feature: {
        code: featureCode,
      },
      enabled: true,
    },
    include: {
      feature: true,
    },
  });

  if (!workspaceFeature) {
    return false;
  }

  // Verificar se trial expirou
  if (workspaceFeature.expiresAt) {
    const now = new Date();
    if (now > workspaceFeature.expiresAt) {
      // Desativar feature expirada
      await prisma.workspaceFeature.update({
        where: { id: workspaceFeature.id },
        data: { enabled: false },
      });
      return false;
    }
  }

  return true;
}

/**
 * Busca todas as features ativas do workspace
 */
export async function getActiveFeatures(
  workspaceId: string
): Promise<Prisma.WorkspaceFeatureGetPayload<{ include: { feature: true } }>[]> {
  if (!workspaceId?.trim()) {
    return [];
  }

  const now = new Date();

  // Buscar features ativas e não expiradas
  const features = await prisma.workspaceFeature.findMany({
    where: {
      workspaceId,
      enabled: true,
      OR: [
        { expiresAt: null },
        { expiresAt: { gt: now } },
      ],
    },
    include: {
      feature: true,
    },
    orderBy: {
      enabledAt: "desc",
    },
  });

  return features;
}

/**
 * Busca todas as features disponíveis no catálogo
 */
export async function getAvailableFeatures(
  category?: FeatureCategory
): Promise<Feature[]> {
  const features = await prisma.feature.findMany({
    where: {
      isActive: true,
      isPublic: true,
      ...(category && { category }),
    },
    orderBy: {
      name: "asc",
    },
  });

  return features;
}

/**
 * Ativa uma feature no workspace
 * 
 * @param workspaceId - ID do workspace
 * @param featureCode - Código da feature
 * @param source - Origem da ativação (PLAN, STORE, PROMOTION, ONBOARDING)
 * @param expiresAt - Data de expiração (opcional, para trials)
 * @returns WorkspaceFeature criado
 */
export async function activateFeature(
  workspaceId: string,
  featureCode: string,
  source: FeatureSource = "STORE",
  expiresAt?: Date
): Promise<WorkspaceFeature> {
  if (!workspaceId?.trim() || !featureCode?.trim()) {
    throw new Error("Workspace ID e Feature Code são obrigatórios");
  }

  // Buscar feature no catálogo
  const feature = await prisma.feature.findUnique({
    where: { code: featureCode },
  });

  if (!feature) {
    throw new Error(`Feature "${featureCode}" não encontrada`);
  }

  if (!feature.isActive) {
    throw new Error(`Feature "${featureCode}" não está ativa`);
  }

  // Verificar se já está ativa
  const existing = await prisma.workspaceFeature.findUnique({
    where: {
      workspaceId_featureId: {
        workspaceId,
        featureId: feature.id,
      },
    },
  });

  if (existing && existing.enabled) {
    // Atualizar se necessário
    if (expiresAt) {
      return prisma.workspaceFeature.update({
        where: { id: existing.id },
        data: { expiresAt, enabled: true },
      });
    }
    return existing;
  }

  // Criar ou atualizar
  return prisma.workspaceFeature.upsert({
    where: {
      workspaceId_featureId: {
        workspaceId,
        featureId: feature.id,
      },
    },
    create: {
      workspaceId,
      featureId: feature.id,
      source,
      enabled: true,
      enabledAt: new Date(),
      expiresAt,
      config: {},
    },
    update: {
      enabled: true,
      enabledAt: new Date(),
      expiresAt,
    },
  });
}

/**
 * Desativa uma feature no workspace
 */
export async function deactivateFeature(
  workspaceId: string,
  featureCode: string
): Promise<void> {
  if (!workspaceId?.trim() || !featureCode?.trim()) {
    throw new Error("Workspace ID e Feature Code são obrigatórios");
  }

  const feature = await prisma.feature.findUnique({
    where: { code: featureCode },
  });

  if (!feature) {
    throw new Error(`Feature "${featureCode}" não encontrada`);
  }

  await prisma.workspaceFeature.updateMany({
    where: {
      workspaceId,
      featureId: feature.id,
    },
    data: {
      enabled: false,
    },
  });
}

/**
 * Compra uma feature usando coins do wallet
 * 
 * @param workspaceId - ID do workspace
 * @param featureCode - Código da feature
 * @param price - Preço em coins
 * @returns WorkspaceFeature ativada
 */
export async function purchaseFeatureWithCoins(
  workspaceId: string,
  featureCode: string,
  price: number
): Promise<WorkspaceFeature> {
  if (!workspaceId?.trim() || !featureCode?.trim()) {
    throw new Error("Workspace ID e Feature Code são obrigatórios");
  }

  if (price <= 0) {
    throw new Error("Preço deve ser maior que zero");
  }

  // Verificar saldo do wallet
  const wallet = await WalletService.getWalletByWorkspaceId(workspaceId);
  
  if (!wallet) {
    throw new Error("Wallet não encontrado para este workspace");
  }

  const balance = wallet.balance.toNumber();
  if (balance < price) {
    throw new Error("Saldo insuficiente para comprar esta feature");
  }

  // Debitar do wallet
  await WalletService.addTransaction({
    walletId: wallet.id,
    type: "EXTENSION_PURCHASE",
    amount: price,
    description: `Compra da feature: ${featureCode}`,
    referenceType: "FEATURE",
    referenceId: featureCode,
  });

  // Ativar feature
  return activateFeature(workspaceId, featureCode, "STORE");
}

/**
 * Verifica se workspace pode acessar uma feature
 * Considera: plano, compra, trial, onboarding
 */
export async function canAccessFeature(
  workspaceId: string,
  featureCode: string
): Promise<boolean> {
  // Verificar se está ativa
  const isEnabled = await isFeatureEnabled(workspaceId, featureCode);
  if (isEnabled) {
    return true;
  }

  // TODO: Verificar se está incluída no plano via BillingService
  // const billingService = new BillingService();
  // const hasPlanAccess = await billingService.checkFeatureAccess(
  //   workspaceId,
  //   featureCode
  // );
  // if (hasPlanAccess) {
  //   return true;
  // }

  return false;
}

/**
 * Verifica features que estão próximas de expirar
 */
export async function getExpiringFeatures(
  workspaceId: string,
  daysAhead: number = 7
): Promise<Prisma.WorkspaceFeatureGetPayload<{ include: { feature: true } }>[]> {
  if (!workspaceId?.trim()) {
    return [];
  }

  const now = new Date();
  const expirationDate = new Date();
  expirationDate.setDate(now.getDate() + daysAhead);

  const features = await prisma.workspaceFeature.findMany({
    where: {
      workspaceId,
      enabled: true,
      expiresAt: {
        gte: now,
        lte: expirationDate,
      },
    },
    include: {
      feature: true,
    },
  });

  return features;
}
