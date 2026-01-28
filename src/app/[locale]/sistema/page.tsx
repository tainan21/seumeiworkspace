import { redirect } from "next/navigation";
import { getCurrentSession } from "~/lib/server/auth/session";
import { SistemaOnboardingWrapper } from "./_components/sistema-onboarding-wrapper";

interface SistemaPageProps {
  params: Promise<{ locale: string }>;
}

export default async function SistemaPage({ params }: SistemaPageProps) {
  const { locale } = await params;
  
  // Verificar autenticação server-side
  const sessionResult = await getCurrentSession();
  
  if (!sessionResult.session || !sessionResult.user) {
    redirect(`/${locale}/login?redirect=/${locale}/sistema`);
  }

  // O wrapper client-side decide se mostra onboarding ou redireciona para dashboard
  return <SistemaOnboardingWrapper locale={locale} />;
}
