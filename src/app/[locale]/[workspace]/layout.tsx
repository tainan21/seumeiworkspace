import { redirect, notFound } from "next/navigation";
import { getWorkspaceContext, getWorkspacePermissions } from "~/lib/middleware/workspace.middleware";
import { WorkspaceProvider } from "~/lib/hooks/useWorkspaceSession";
import { LazyWorkspaceHeader, LazyWorkspaceSidebar } from "~/components/lazy";
import * as WorkspaceService from "~/domains/workspace/services/workspace.service";

interface WorkspaceLayoutProps {
  children: React.ReactNode;
  params: Promise<{ workspace: string; locale: string }>;
}

/**
 * Layout do workspace
 * Valida autenticação e acesso ao workspace
 */
export default async function WorkspaceLayout({
  children,
  params,
}: WorkspaceLayoutProps) {
  try {
    const { workspace: workspaceSlug } = await params;

    if (!workspaceSlug?.trim()) {
      notFound();
    }

    // Validar acesso ao workspace usando o middleware helper
    const context = await getWorkspaceContext(workspaceSlug);

    if (!context) {
      // Log detalhado para debug
      console.warn(
        `[WorkspaceLayout] Context não encontrado para workspace: ${workspaceSlug}. ` +
        `Redirecionando para /dashboard/workspaces`
      );
      redirect("/dashboard/workspaces");
    }

    // Buscar workspace completo para exibir informações
    const workspace = await WorkspaceService.getWorkspaceById(context.workspaceId);

    if (!workspace) {
      console.warn(
        `[WorkspaceLayout] Workspace não encontrado: ${context.workspaceId}. ` +
        `Redirecionando para /dashboard/workspaces`
      );
      redirect("/dashboard/workspaces");
    }

    // Calcular permissões
    const permissions = getWorkspacePermissions(context.role);

    // Criar valor do contexto para o provider
    const workspaceContextValue = {
      workspaceId: context.workspaceId,
      workspaceSlug: context.workspaceSlug,
      role: context.role,
      userId: context.userId,
      ...permissions,
    };

    return (
      <WorkspaceProvider value={workspaceContextValue}>
        <div className="flex min-h-screen flex-col">
          {/* Workspace Header/Navbar - Lazy loaded */}
          <LazyWorkspaceHeader
            workspaceName={workspace.name}
            workspaceSlug={workspace.slug}
          />

          <div className="flex flex-1">
            {/* Workspace Sidebar - Lazy loaded */}
            <LazyWorkspaceSidebar workspaceId={workspace.id} />

            {/* Main Content */}
            <main className="flex-1 p-6">{children}</main>
          </div>
        </div>
      </WorkspaceProvider>
    );
  } catch (error) {
    // Tratar erros de redirect separadamente (não são erros reais)
    if (error && typeof error === "object" && "digest" in error) {
      // Erro de redirect do Next.js - apenas relançar
      throw error;
    }

    console.error("[WorkspaceLayout] Erro inesperado:", error);
    console.error("[WorkspaceLayout] Stack:", error instanceof Error ? error.stack : "N/A");
    
    // Redirecionar apenas se não for um erro de redirect
    redirect("/dashboard/workspaces");
  }
}
