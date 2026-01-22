import { notFound } from "next/navigation";
import { PageHeader } from "~/components/features/shared";
import { getWorkspaceContext } from "~/lib/middleware/workspace.middleware";
import * as ProjectService from "~/domains/projects/services/project.service";

interface ProjectDetailPageProps {
  params: Promise<{ workspace: string; id: string; locale: string }>;
}

/**
 * Página de detalhes do projeto
 */
export default async function ProjectDetailPage({
  params,
}: ProjectDetailPageProps) {
  const { workspace: workspaceSlug, id: projectId } = await params;

  if (!workspaceSlug?.trim() || !projectId?.trim()) {
    notFound();
  }

  // Validar acesso ao workspace
  const context = await getWorkspaceContext(workspaceSlug);

  if (!context) {
    notFound();
  }

  // Buscar projeto
  const project = await ProjectService.getProjectById(
    context.workspaceId,
    projectId
  );

  if (!project) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={project.name}
        description={`Projeto: ${project.domain}`}
      />

      <div className="bg-card rounded-lg border p-6">
        <p className="text-muted-foreground">
          Detalhes do projeto serão exibidos aqui
        </p>
      </div>
    </div>
  );
}
