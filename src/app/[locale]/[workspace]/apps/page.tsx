import { notFound } from "next/navigation";
import { PageHeader } from "~/components/features/shared";
import { AppsMarketplace } from "~/components/apps/apps-marketplace";
import { getWorkspaceContext, getWorkspacePermissions } from "~/lib/middleware/workspace.middleware";
import * as FeaturesService from "~/domains/features";

interface AppsPageProps {
  params: Promise<{ workspace: string; locale: string }>;
}

/**
 * Página do marketplace de apps
 */
export default async function AppsPage({ params }: AppsPageProps) {
  const { workspace: workspaceSlug } = await params;

  if (!workspaceSlug?.trim()) {
    notFound();
  }

  // Validar acesso ao workspace
  const context = await getWorkspaceContext(workspaceSlug);

  if (!context) {
    notFound();
  }

  // Buscar features disponíveis e ativas
  const [availableFeatures, activeFeatures] = await Promise.all([
    FeaturesService.getAvailableFeatures(),
    FeaturesService.getActiveFeatures(context.workspaceId),
  ]);

  const activeFeatureCodes = new Set(
    activeFeatures.map((f) => f.feature.code)
  );

  // Calcular permissões
  const permissions = getWorkspacePermissions(context.role);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Marketplace de Apps"
        description="Descubra e ative novos recursos para seu workspace"
      />

      <AppsMarketplace
        workspaceId={context.workspaceId}
        availableFeatures={availableFeatures}
        activeFeatureCodes={activeFeatureCodes}
        canWrite={permissions.canWrite}
      />
    </div>
  );
}
