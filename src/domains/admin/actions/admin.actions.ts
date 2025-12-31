"use server";

import { redirect } from "next/navigation";
import { getCurrentSession } from "~/lib/server/auth/session";
import { AdminService } from "../services/admin.service";
import type {
  WorkspaceFilters,
  WorkspacesResponse,
  GlobalStats,
  WorkspaceDetails,
} from "../types";

const adminService = new AdminService();

/**
 * Verifica se o usuário atual é admin global
 * Redireciona se não for
 */
async function requireAdmin() {
  const { user } = await getCurrentSession();
  if (!user) {
    redirect("/login");
  }

  const isAdmin = await adminService.isGlobalAdmin(user.id);
  if (!isAdmin) {
    throw new Error("Unauthorized: Admin access required");
  }

  return user.id;
}

/**
 * Lista todos os workspaces (apenas admin)
 */
export async function listAllWorkspacesAction(
  filters?: WorkspaceFilters
): Promise<WorkspacesResponse> {
  await requireAdmin();
  return adminService.listAllWorkspaces(filters);
}

/**
 * Obtém detalhes de um workspace específico (apenas admin)
 */
export async function getWorkspaceDetailsAction(
  workspaceId: string
): Promise<WorkspaceDetails | null> {
  await requireAdmin();
  return adminService.getWorkspaceDetails(workspaceId);
}

/**
 * Obtém estatísticas globais (apenas admin)
 */
export async function getGlobalStatsAction(): Promise<GlobalStats> {
  await requireAdmin();
  return adminService.getGlobalStats();
}

/**
 * Verifica se o usuário atual é admin (sem redirecionar)
 */
export async function checkIsAdminAction(): Promise<boolean> {
  const { user } = await getCurrentSession();
  if (!user) return false;
  return adminService.isGlobalAdmin(user.id);
}
