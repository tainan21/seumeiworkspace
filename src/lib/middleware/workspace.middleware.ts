import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "~/lib/server/auth/session";
import * as WorkspaceService from "~/domains/workspace/services/workspace.service";
import { WorkspaceRole } from "@prisma/client";

export interface WorkspaceContext {
  workspaceId: string;
  workspaceSlug: string;
  role: WorkspaceRole;
  userId: string;
}

/**
 * Middleware para validar acesso ao workspace
 * Extrai o slug do workspace da URL e valida se o usuário tem acesso
 * 
 * @param request - Next.js request
 * @param workspaceSlug - Slug do workspace extraído da URL
 * @returns NextResponse com headers de contexto ou redirect
 */
export async function workspaceMiddleware(
  request: NextRequest,
  workspaceSlug: string
): Promise<NextResponse> {
  // 1. Validar autenticação
  const sessionResult = await getCurrentSession();

  if (!sessionResult.session || !sessionResult.user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  const userId = sessionResult.user.id;

  // 2. Validar slug
  if (!workspaceSlug?.trim()) {
    return NextResponse.redirect(new URL("/dashboard/workspaces", request.url));
  }

  // 3. Buscar workspace por slug
  const workspace = await WorkspaceService.getWorkspaceBySlug(workspaceSlug);

  if (!workspace) {
    return NextResponse.redirect(new URL("/dashboard/workspaces", request.url));
  }

  // 4. Verificar se usuário é membro do workspace
  const isMember = await WorkspaceService.isUserMemberOfWorkspace(
    userId,
    workspace.id
  );

  if (!isMember) {
    return NextResponse.redirect(new URL("/dashboard/workspaces", request.url));
  }

  // 5. Buscar role do usuário no workspace
  const role = await WorkspaceService.getUserRoleInWorkspace(
    userId,
    workspace.id
  );

  if (!role) {
    return NextResponse.redirect(new URL("/dashboard/workspaces", request.url));
  }

  // 6. Adicionar headers de contexto
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-workspace-id", workspace.id);
  requestHeaders.set("x-workspace-slug", workspace.slug);
  requestHeaders.set("x-workspace-role", role);
  requestHeaders.set("x-user-id", userId);

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

/**
 * Helper para obter contexto do workspace em Server Components
 * Valida acesso e retorna informações do workspace
 * 
 * @param workspaceSlug - Slug do workspace
 * @returns WorkspaceContext ou null se não tiver acesso
 */
export async function getWorkspaceContext(
  workspaceSlug: string
): Promise<WorkspaceContext | null> {
  try {
    // 1. Validar autenticação
    const sessionResult = await getCurrentSession();

    if (!sessionResult.session || !sessionResult.user) {
      console.warn(
        `[getWorkspaceContext] Usuário não autenticado para workspace: ${workspaceSlug}`
      );
      return null;
    }

    const userId = sessionResult.user.id;

    // 2. Validar slug
    if (!workspaceSlug?.trim()) {
      console.warn(`[getWorkspaceContext] Slug vazio ou inválido`);
      return null;
    }

    // 3. Buscar workspace
    const workspace = await WorkspaceService.getWorkspaceBySlug(workspaceSlug);

    if (!workspace) {
      console.warn(
        `[getWorkspaceContext] Workspace não encontrado: ${workspaceSlug}`
      );
      return null;
    }

    // 4. Verificar membership
    const isMember = await WorkspaceService.isUserMemberOfWorkspace(
      userId,
      workspace.id
    );

    if (!isMember) {
      console.warn(
        `[getWorkspaceContext] Usuário ${userId} não é membro do workspace ${workspace.id}`
      );
      return null;
    }

    // 5. Buscar role
    const role = await WorkspaceService.getUserRoleInWorkspace(
      userId,
      workspace.id
    );

    if (!role) {
      console.warn(
        `[getWorkspaceContext] Role não encontrado para usuário ${userId} no workspace ${workspace.id}`
      );
      return null;
    }

    return {
      workspaceId: workspace.id,
      workspaceSlug: workspace.slug,
      role,
      userId,
    };
  } catch (error) {
    console.error(
      `[getWorkspaceContext] Erro ao obter contexto do workspace ${workspaceSlug}:`,
      error
    );
    return null;
  }
}

/**
 * Helper para verificar permissões do usuário no workspace
 * 
 * @param role - Role do usuário no workspace
 * @returns Objeto com flags de permissão
 */
export function getWorkspacePermissions(role: WorkspaceRole) {
  return {
    canRead: true, // Todos os roles podem ler
    canWrite: ["OWNER", "ADMIN", "MANAGER"].includes(role),
    canManage: ["OWNER", "ADMIN"].includes(role),
    isOwner: role === "OWNER",
    isAdmin: role === "ADMIN" || role === "OWNER",
    isManager: role === "MANAGER",
    isOperator: role === "OPERATOR",
    isViewer: role === "VIEWER",
  };
}
