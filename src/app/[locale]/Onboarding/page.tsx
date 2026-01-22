import { redirect } from "next/navigation";
import { getCurrentSession } from "~/lib/server/auth/session";
import { NewWorkspaceOnboarding } from "~/components/onboarding/new-workspace-onboarding";

interface OnboardingPageProps {
  params: Promise<{ locale: string }>;
}

/**
 * Página de onboarding inicial para criação de workspace
 * Acessível sem workspace, usa Zustand store para estado temporário
 */
export default async function InitialOnboardingPage({
  params,
}: OnboardingPageProps) {
  // Verificar autenticação
  const sessionResult = await getCurrentSession();

  if (!sessionResult.session || !sessionResult.user) {
    redirect("/login?redirect=/onboarding");
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-10">
        <NewWorkspaceOnboarding />
      </div>
    </div>
  );
}
