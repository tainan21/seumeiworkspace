import { redirect } from "next/navigation";
import { getCurrentSession } from "~/lib/server/auth/session";
import { NewWorkspaceOnboarding } from "~/components/onboarding/new-workspace-onboarding";

interface SistemaOnboardingPageProps {
  params: Promise<{ locale: string }>;
}

/**
 * Página de onboarding para criação de workspace no sistema
 * Acessível sem workspace, usa Zustand store para estado temporário
 */
export default async function SistemaOnboardingPage({ params }: SistemaOnboardingPageProps) {
  const { locale } = await params;
  const sessionResult = await getCurrentSession();
  
  if (!sessionResult.session || !sessionResult.user) {
    redirect(`/${locale}/login?redirect=/${locale}/sistema/onboarding`);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto py-8 px-4">
        <NewWorkspaceOnboarding locale={locale} />
      </div>
    </div>
  );
}
