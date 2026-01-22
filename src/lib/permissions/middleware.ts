"use server";

import { requireAuth, requireWorkspaceMembership, requireWriteAccess, requireManageAccess, requireFeatureAccess } from "./permission-checker";
import type { WorkspaceRole } from "@prisma/client";

/**
 * Middleware para validar autenticação
 */
export function withAuth<Args extends any[], Return>(
  action: (userId: string, ...args: Args) => Promise<Return>
) {
  return async (...args: Args): Promise<Return> => {
    const userId = await requireAuth();
    return await action(userId, ...args);
  };
}

/**
 * Middleware para validar membership no workspace
 */
export function withWorkspaceAccess<Args extends any[], Return>(
  action: (workspaceId: string, userId: string, ...args: Args) => Promise<Return>,
  getWorkspaceId: (...args: Args) => string
) {
  return async (...args: Args): Promise<Return> => {
    const userId = await requireAuth();
    const workspaceId = getWorkspaceId(...args);
    await requireWorkspaceMembership(workspaceId, userId);
    return await action(workspaceId, userId, ...args);
  };
}

/**
 * Middleware para validar permissão de escrita
 */
export function withWriteAccess<Args extends any[], Return>(
  action: (workspaceId: string, userId: string, ...args: Args) => Promise<Return>,
  getWorkspaceId: (...args: Args) => string
) {
  return async (...args: Args): Promise<Return> => {
    const userId = await requireAuth();
    const workspaceId = getWorkspaceId(...args);
    await requireWriteAccess(workspaceId, userId);
    return await action(workspaceId, userId, ...args);
  };
}

/**
 * Middleware para validar permissão de gerenciamento
 */
export function withManageAccess<Args extends any[], Return>(
  action: (workspaceId: string, userId: string, ...args: Args) => Promise<Return>,
  getWorkspaceId: (...args: Args) => string
) {
  return async (...args: Args): Promise<Return> => {
    const userId = await requireAuth();
    const workspaceId = getWorkspaceId(...args);
    await requireManageAccess(workspaceId, userId);
    return await action(workspaceId, userId, ...args);
  };
}

/**
 * Middleware para validar acesso a feature
 */
export function withFeatureAccess<Args extends any[], Return>(
  action: (workspaceId: string, ...args: Args) => Promise<Return>,
  getWorkspaceId: (...args: Args) => string,
  getFeatureCode: (...args: Args) => string
) {
  return async (...args: Args): Promise<Return> => {
    const workspaceId = getWorkspaceId(...args);
    const featureCode = getFeatureCode(...args);
    await requireFeatureAccess(workspaceId, featureCode);
    return await action(workspaceId, ...args);
  };
}
