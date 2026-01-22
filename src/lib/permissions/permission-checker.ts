"use server";

import { getCurrentSession } from "~/lib/server/auth/session";
import * as WorkspaceService from "~/domains/workspace/services/workspace.service";
import * as FeaturesService from "~/domains/features";
import { AuthorizationError, AuthenticationError } from "../errors/error-types";
import { WorkspaceRole } from "@prisma/client";

/**
 * Verifica se usuário está autenticado
 */
export async function requireAuth(): Promise<string> {
  const session = await getCurrentSession();

  if (!session.user?.id) {
    throw new AuthenticationError();
  }

  return session.user.id;
}

/**
 * Verifica se usuário é membro do workspace
 */
export async function requireWorkspaceMembership(
  workspaceId: string,
  userId: string
): Promise<void> {
  const isMember = await WorkspaceService.isUserMemberOfWorkspace(
    userId,
    workspaceId
  );

  if (!isMember) {
    throw new AuthorizationError("Você não tem acesso a este workspace");
  }
}

/**
 * Verifica se usuário tem role específico no workspace
 */
export async function requireWorkspaceRole(
  workspaceId: string,
  userId: string,
  requiredRoles: WorkspaceRole[]
): Promise<WorkspaceRole> {
  const role = await WorkspaceService.getUserRoleInWorkspace(
    userId,
    workspaceId
  );

  if (!role) {
    throw new AuthorizationError("Você não tem acesso a este workspace");
  }

  if (!requiredRoles.includes(role)) {
    throw new AuthorizationError(
      `Acesso negado. Roles permitidos: ${requiredRoles.join(", ")}`
    );
  }

  return role;
}

/**
 * Verifica se usuário pode escrever no workspace
 */
export async function requireWriteAccess(
  workspaceId: string,
  userId: string
): Promise<void> {
  const role = await WorkspaceService.getUserRoleInWorkspace(
    userId,
    workspaceId
  );

  if (!role) {
    throw new AuthorizationError();
  }

  const canWrite = ["OWNER", "ADMIN", "MANAGER"].includes(role);

  if (!canWrite) {
    throw new AuthorizationError("Você não tem permissão para realizar esta ação");
  }
}

/**
 * Verifica se usuário pode gerenciar o workspace
 */
export async function requireManageAccess(
  workspaceId: string,
  userId: string
): Promise<void> {
  const role = await WorkspaceService.getUserRoleInWorkspace(
    userId,
    workspaceId
  );

  if (!role) {
    throw new AuthorizationError();
  }

  const canManage = ["OWNER", "ADMIN"].includes(role);

  if (!canManage) {
    throw new AuthorizationError("Apenas administradores podem realizar esta ação");
  }
}

/**
 * Verifica se workspace tem acesso a uma feature
 */
export async function requireFeatureAccess(
  workspaceId: string,
  featureCode: string
): Promise<void> {
  const hasAccess = await FeaturesService.canAccessFeature(
    workspaceId,
    featureCode
  );

  if (!hasAccess) {
    throw new AuthorizationError(
      `Feature "${featureCode}" não está disponível para este workspace`
    );
  }
}
