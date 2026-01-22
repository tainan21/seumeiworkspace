"use server";

import { getCurrentSession } from "~/lib/server/auth/session";

/**
 * Resultado padrão de server actions
 */
export type ActionResult<T = void> =
    | { success: true; data: T }
    | { success: false; error: string };

/**
 * Wrapper para server actions com autenticação
 * Simplifica o tratamento de erros e validação de usuário
 */
export async function withAuth<T>(
    action: (userId: string) => Promise<T>
): Promise<ActionResult<T>> {
    try {
        const { user } = await getCurrentSession();

        if (!user?.id) {
            return {
                success: false,
                error: "Usuário não autenticado",
            };
        }

        const data = await action(user.id);

        return {
            success: true,
            data,
        };
    } catch (error) {
        console.error("[withAuth] Error:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Erro desconhecido",
        };
    }
}

/**
 * Wrapper genérico para tratamento de erros em server actions
 */
export async function handleAction<T>(
    action: () => Promise<T>
): Promise<ActionResult<T>> {
    try {
        const data = await action();
        return {
            success: true,
            data,
        };
    } catch (error) {
        console.error("[handleAction] Error:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Erro ao processar ação",
        };
    }
}
