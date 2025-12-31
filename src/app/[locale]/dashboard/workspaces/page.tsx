import Link from "next/link";
import { Card } from "~/components/ui/card";
import { PageHeader, EmptyState } from "~/components/features/shared";
import { Building2 } from "lucide-react";
import { getProjects } from "../projects/action";
import CreateProjectModal from "./create-project-modal";

export default async function WorkspacesPage() {
  const projects = await getProjects();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Workspaces"
        description="Gerencie seus workspaces e empresas"
      />

      {projects.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="Nenhum workspace encontrado"
          description="Comece criando seu primeiro workspace para organizar seus negócios"
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
          <CreateProjectModal />
          {projects.map(
            (project: Awaited<ReturnType<typeof getProjects>>[number]) => (
              <Card
                role="button"
                key={project.id}
                className="hover:bg-accent relative flex flex-col items-center justify-center gap-y-2.5 p-8 text-center transition-colors"
              >
                <Building2 className="text-muted-foreground mb-2 h-8 w-8" />
                <h4 className="font-medium">{project.name}</h4>
                <p className="text-muted-foreground text-sm">{`https://${project.domain}`}</p>
                <Link
                  href={`/dashboard/workspaces/${project.id}`}
                  className="absolute inset-0"
                >
                  <span className="sr-only">Ver detalhes do workspace</span>
                </Link>
              </Card>
            )
          )}
        </div>
      )}
    </div>
  );
}
