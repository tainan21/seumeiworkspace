"use server";

/**
 * Service para gerenciar temas
 * Preparado para integração futura com ThemeUI do schema
 */

import type { ThemeConfig } from "~/types/theme";

/**
 * Busca configuração de tema do workspace
 * @param workspaceId - ID do workspace
 * @returns Configuração do tema
 */
export async function getThemeConfig(
  workspaceId: string
): Promise<ThemeConfig> {
  if (!workspaceId?.trim()) {
    throw new Error("Workspace ID é obrigatório");
  }

  try {
    // TODO: Buscar do banco quando schema estiver pronto
    // const theme = await prisma.themeUI.findFirst({
    //   where: { workspaceId },
    // });
    // return theme?.config ?? { mode: "light", preset: "default" };

    return {
      mode: "light",
      preset: "default",
    };
  } catch (error) {
    console.error("[getThemeConfig] Error:", error);
    // Retorna tema padrão em caso de erro
    return {
      mode: "light",
      preset: "default",
    };
  }
}

/**
 * Atualiza configuração de tema do workspace
 * @param workspaceId - ID do workspace
 * @param config - Configuração parcial do tema
 * @throws {Error} Se houver erro ao atualizar
 */
export async function updateThemeConfig(
  workspaceId: string,
  config: Partial<ThemeConfig>
): Promise<void> {
  if (!workspaceId?.trim()) {
    throw new Error("Workspace ID é obrigatório");
  }

  try {
    // TODO: Atualizar no banco quando schema estiver pronto
    // await prisma.themeUI.upsert({
    //   where: { workspaceId },
    //   create: { workspaceId, config },
    //   update: { config },
    // });

    console.log(
      `[updateThemeConfig] Would update theme for workspace ${workspaceId}`,
      config
    );
  } catch (error) {
    console.error("[updateThemeConfig] Error:", error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "Erro ao atualizar tema. Tente novamente."
    );
  }
}
