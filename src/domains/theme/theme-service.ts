"use server";

/**
 * Service para gerenciar temas
 * Integrado com o sistema consolidado de tipos
 */

import type { ThemeConfig } from "~/types/theme";
import { validateThemeConfig } from "~/types/theme";
import { prisma } from "~/lib/server/db";
import { ThemeUIType } from "@prisma/client";
import { getMainEnterprise } from "~/domains/enterprise/services/enterprise.service";

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
    const theme = await prisma.themeUI.findFirst({
      where: { workspaceId },
    });

    if (!theme) {
      return validateThemeConfig({
        mode: "light",
        preset: "default",
      });
    }

    return validateThemeConfig({
      mode: theme.darkModeEnabled ? "dark" : "light",
      preset: theme.themeName as any,
      colors: theme.colors as any,
    });
  } catch (error) {
    console.error("[getThemeConfig] Error:", error);
    // Retorna tema padrão em caso de erro
    return validateThemeConfig({
      mode: "light",
      preset: "default",
    });
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
    const validatedConfig = validateThemeConfig(config);

    // Tenta buscar o tema existente primeiro
    const existingTheme = await prisma.themeUI.findFirst({
      where: { workspaceId },
    });

    if (existingTheme) {
      // Se já existe, atualiza usando o ID
      await prisma.themeUI.update({
        where: { id: existingTheme.id },
        data: {
          darkModeEnabled: validatedConfig.mode === "dark",
          themeName: validatedConfig.preset,
          themeType: ThemeUIType.TEMPLATE,
          colors: validatedConfig.colors as any ?? {},
        }
      });
    } else {
      // Se não existe, precisamos do enterpriseMotherId
      let enterpriseId: string | null = null;

      const workspace = await prisma.workspace.findUnique({
        where: { id: workspaceId },
        select: { enterpriseMotherId: true },
      });

      if (workspace?.enterpriseMotherId) {
        enterpriseId = workspace.enterpriseMotherId;
      } else {
        // Fallback: busca enterprise principal
        const enterprise = await getMainEnterprise(workspaceId);
        if (enterprise) {
          enterpriseId = enterprise.id;
          // Atualizar link no workspace
          await prisma.workspace.update({
            where: { id: workspaceId },
            data: { enterpriseMotherId: enterprise.id }
          });
        }
      }

      if (!enterpriseId) {
        throw new Error("É necessário configurar a empresa antes de definir o tema");
      }

      await prisma.themeUI.create({
        data: {
          workspaceId,
          enterpriseMotherId: enterpriseId,
          darkModeEnabled: validatedConfig.mode === "dark",
          themeName: validatedConfig.preset,
          themeType: ThemeUIType.TEMPLATE,
          colors: validatedConfig.colors as any ?? {},
          typography: {},
          layout: {},
        }
      });
    }
  } catch (error) {
    console.error("[updateThemeConfig] Error:", error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "Erro ao atualizar tema. Tente novamente."
    );
  }
}

