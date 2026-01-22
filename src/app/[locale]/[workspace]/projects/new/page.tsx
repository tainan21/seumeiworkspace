import { notFound, redirect } from "next/navigation";
import { PageHeader } from "~/components/features/shared";
import { ProjectForm } from "~/components/projects/project-form";
import { getWorkspaceContext, getWorkspacePermissions } from "~/lib/middleware/workspace.middleware";

interface NewProjectPageProps {
  params: Promise<{ workspace: string; locale: string }>;
}

/**
 * Página de criação de projeto
 */
export default async function NewProjectPage({ params }: NewProjectPageProps) {
  const { workspace: workspaceSlug } = await params;

  if (!workspaceSlug?.trim()) {
    notFound();
  }

  // Validar acesso ao workspace
  const context = await getWorkspaceContext(workspaceSlug);

  if (!context) {
    notFound();
  }

  // Calcular permissões
  const permissions = getWorkspacePermissions(context.role);

  // Verificar permissão de escrita
  if (!permissions.canWrite) {
    redirect(`/${workspaceSlug}/projects`);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Novo Projeto"
        description="Crie um novo projeto no seu workspace"
      />

      <ProjectForm workspaceId={context.workspaceId} />
    </div>
  );
}
