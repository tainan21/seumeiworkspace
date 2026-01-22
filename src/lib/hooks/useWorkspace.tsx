"use client";

import { createContext, useContext, use } from "react";
import { WorkspaceRole } from "@prisma/client";

export interface WorkspaceContextValue {
  workspaceId: string;
  workspaceSlug: string;
  role: WorkspaceRole;
  userId: string;
  canRead: boolean;
  canWrite: boolean;
  canManage: boolean;
  isOwner: boolean;
  isAdmin: boolean;
  isManager: boolean;
  isOperator: boolean;
  isViewer: boolean;
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

/**
 * Provider para contexto do workspace
 * Deve ser usado em Server Components para passar dados para Client Components
 */
export function WorkspaceProvider({
  children,
  value,
}: {
  children: React.ReactNode;
  value: WorkspaceContextValue;
}) {
  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
}

/**
 * Hook para acessar contexto do workspace em Client Components
 * 
 * @returns WorkspaceContextValue com informações do workspace e permissões
 * @throws Error se usado fora do WorkspaceProvider
 * 
 * @example
 * ```tsx
 * const { workspaceId, role, canWrite } = useWorkspace();
 * ```
 */
export function useWorkspace(): WorkspaceContextValue {
  const context = useContext(WorkspaceContext);

  if (!context) {
    throw new Error(
      "useWorkspace must be used within a WorkspaceProvider. " +
      "Make sure to wrap your component with WorkspaceProvider."
    );
  }

  return context;
}

/**
 * Helper para calcular permissões baseado no role
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
