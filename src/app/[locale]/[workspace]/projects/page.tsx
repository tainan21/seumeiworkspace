import { notFound } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Plus, FolderKanban } from "lucide-react";
import Link from "next/link";
import { getWorkspaceContext, getWorkspacePermissions } from "~/lib/middleware/workspace.middleware";
import * as ProjectService from "~/domains/projects/services/project.service";

interface ProjectsPageProps {
  params: Promise<{ workspace: string; locale: string }>;
}

/**
 * Página de listagem de projetos
 */
export default async function ProjectsPage({ params }: ProjectsPageProps) {
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

  // Buscar projetos do workspace
  const projects = await ProjectService.getProjects(context.workspaceId);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projetos</h1>
          <p className="text-muted-foreground">
            Gerencie seus projetos e tarefas
          </p>
        </div>
        {permissions.canWrite && (
          <Link href={`/${workspaceSlug}/projects/new`}>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Projeto
            </Button>
          </Link>
        )}
      </div>

      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="bg-muted mb-4 rounded-full p-4">
            <FolderKanban className="text-muted-foreground h-8 w-8" />
          </div>
          <h3 className="mb-2 text-lg font-semibold">
            Nenhum projeto encontrado
          </h3>
          <p className="text-muted-foreground mb-4 max-w-sm text-sm">
            Crie seu primeiro projeto para começar a organizar suas tarefas
          </p>
          {permissions.canWrite && (
            <Link href={`/${workspaceSlug}/projects/new`}>
              <Button variant="default">Criar Projeto</Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/${workspaceSlug}/projects/${project.id}`}
            >
              <div className="p-6 rounded-lg border bg-card hover:shadow-md transition-shadow">
                <h3 className="font-semibold mb-2">{project.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {project.domain}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
