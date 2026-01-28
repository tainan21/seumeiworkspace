import { redirect, notFound } from "next/navigation";
import { getOnboardingState } from "./actions";
import { OnboardingRouter } from "~/components/onboarding/onboarding-router";
import { isRedirectError } from "~/lib/utils";

interface OnboardingPageProps {
    params: Promise<{
        workspace: string; // This is the slug
        locale: string;
    }>;
}

/**
 * Página de onboarding para workspace existente
 * Usa OnboardingRouter para decidir qual fluxo usar
 */
export default async function OnboardingPage({ params }: OnboardingPageProps) {
    try {
        const { workspace: slug } = await params;

        if (!slug) {
            notFound();
        }

        const state = await getOnboardingState(slug);

        if (!state) {
            redirect("/dashboard/workspaces");
        }
        
        // Se já estiver completo, redirecionar para dashboard
        if (state.progress.isCompleted) {
            redirect(`/${slug}`);
        }

        return (
            <div className="container mx-auto py-10">
                <OnboardingRouter
                    type="existing-workspace"
                    workspace={state.workspace}
                    progress={state.progress}
                />
            </div>
        );
    } catch (error) {
        // Verificar se é um erro de redirect do Next.js (não é um erro real)
        if (isRedirectError(error)) {
            // Relançar o erro de redirect para que o Next.js o trate corretamente
            throw error;
        }

        // Tratar apenas erros reais
        console.error("[OnboardingPage] Erro inesperado:", error);
        console.error("[OnboardingPage] Stack:", error instanceof Error ? error.stack : "N/A");

        // Em caso de erro real (ex: sem permissão), redirecionar
        redirect("/dashboard/workspaces");
    }
}
