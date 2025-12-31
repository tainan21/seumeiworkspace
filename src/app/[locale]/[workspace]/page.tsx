import { notFound } from "next/navigation";
import { DashboardOverview } from "~/components/features/dashboard";
import { PageHeader } from "~/components/features/shared";

interface WorkspacePageProps {
  params: Promise<{ workspace: string; locale: string }>;
}

/**
 * Página principal do workspace
 * Exibe dashboard e estatísticas do workspace
 */
export default async function WorkspacePage({ params }: WorkspacePageProps) {
  try {
    const { workspace: workspaceSlug } = await params;

    if (!workspaceSlug?.trim()) {
      notFound();
    }

    // TODO: Buscar dados reais do workspace
    // const workspace = await getWorkspaceBySlug(workspaceSlug);
    // if (!workspace) {
    //   notFound();
    // }
    // const stats = await getWorkspaceStats(workspace.id);

    return (
      <div className="space-y-6">
        <PageHeader
          title={`Workspace: ${workspaceSlug}`}
          description="Visão geral do seu workspace"
        />

        {/* TODO: Substituir por dados reais */}
        <DashboardOverview
          stats={[
            {
              title: "Total de Projetos",
              value: "0",
              description: "Projetos ativos",
            },
            {
              title: "Membros",
              value: "1",
              description: "Membros ativos",
            },
          ]}
        />

        {/* Conteúdo adicional será adicionado aqui */}
        <div className="bg-card text-card-foreground rounded-lg border p-6">
          <p className="text-muted-foreground">
            Dashboard do workspace em desenvolvimento...
          </p>
        </div>
      </div>
    );
  } catch (error) {
    console.error("[WorkspacePage] Error:", error);
    notFound();
  }
}
