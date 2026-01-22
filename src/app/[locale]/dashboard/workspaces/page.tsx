import Link from "next/link";
import { Card } from "~/components/ui/card";
import { PageHeader, EmptyState } from "~/components/features/shared";
import { Building2 } from "lucide-react";
import { getWorkspaces } from "./actions";
import CreateProjectModal from "./create-project-modal";

export default async function WorkspacesPage() {
  const workspaces = await getWorkspaces();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Workspaces"
        description="Gerencie seus workspaces e empresas"
      />

      {workspaces.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8">
          <CreateProjectModal />
          <p className="mt-4 text-muted-foreground text-center">
            Você ainda não tem nenhum workspace. Crie o primeiro para começar!
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
          <CreateProjectModal />
          {workspaces.map((workspace) => (
            <Card
              role="button"
              key={workspace.id}
              className="hover:bg-accent relative flex flex-col items-center justify-center gap-y-2.5 p-8 text-center transition-colors"
            >
              <Building2 className="text-muted-foreground mb-2 h-8 w-8" />
              <h4 className="font-medium">{workspace.name}</h4>
              <p className="text-muted-foreground text-sm">
                {`/${workspace.slug}`}
              </p>
              <Link
                href={`/${workspace.slug}/onboarding`}
                className="absolute inset-0"
              >
                <span className="sr-only">Ver detalhes do workspace</span>
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
