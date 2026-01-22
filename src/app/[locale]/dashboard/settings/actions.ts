"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "~/lib/server/db";
import { utapi } from "~/lib/server/upload";
import { getImageKeyFromUrl, isOurCdnUrl } from "~/lib/utils";
import {
  withAuth,
  type ActionResult,
} from "~/lib/server/action-utils";
import {
  validateEmail,
  sanitizeString,
} from "~/lib/utils/validation";

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  image?: string;
}

/**
 * Atualiza dados do usuário
 */
export async function updateUser(
  id: string,
  payload: UpdateUserPayload
): Promise<ActionResult<void>> {
  return withAuth(async (userId) => {
    // Verificar se está atualizando o próprio perfil
    if (id !== userId) {
      throw new Error("Sem permissão para atualizar este usuário");
    }

    // Validar e sanitizar dados
    const sanitizedPayload: UpdateUserPayload = {};

    if (payload.name) {
      sanitizedPayload.name = sanitizeString(payload.name);
      if (sanitizedPayload.name.length < 2) {
        throw new Error("Nome deve ter pelo menos 2 caracteres");
      }
    }

    if (payload.email) {
      const email = payload.email.trim().toLowerCase();
      if (!validateEmail(email)) {
        throw new Error("E-mail inválido");
      }
      sanitizedPayload.email = email;
    }

    if (payload.image) {
      sanitizedPayload.image = payload.image;
    }

    // Atualizar usuário
    await prisma.user.update({
      where: { id },
      data: sanitizedPayload,
    });

    // TODO: Registrar activity log quando workspace estiver disponível
    // await ActivityLogger.log({
    //   workspaceId: 'workspace_id_aqui',
    //   userId: id,
    //   action: 'SETTINGS_UPDATED',
    //   entityType: 'SETTINGS',
    //   metadata: { updatedFields: Object.keys(sanitizedPayload) },
    // });

    revalidatePath("/dashboard/settings");
  });
}

/**
 * Remove imagem antiga do CDN
 */
export async function removeUserOldImageFromCDN(
  newImageUrl: string,
  currentImageUrl: string
): Promise<ActionResult<void>> {
  try {
    if (!isOurCdnUrl(currentImageUrl)) {
      return { success: true, data: undefined };
    }

    const currentImageFileKey = getImageKeyFromUrl(currentImageUrl);

    if (currentImageFileKey) {
      await utapi.deleteFiles(currentImageFileKey);
    }

    return { success: true, data: undefined };
  } catch (error) {
    console.error("[removeUserOldImageFromCDN] Error:", error);

    // Tentar remover a nova imagem em caso de erro
    try {
      const newImageFileKey = getImageKeyFromUrl(newImageUrl);
      if (newImageFileKey) {
        await utapi.deleteFiles(newImageFileKey);
      }
    } catch (cleanupError) {
      console.error("[removeUserOldImageFromCDN] Cleanup error:", cleanupError);
    }

    return {
      success: false,
      error: "Erro ao remover imagem antiga",
    };
  }
}

/**
 * Remove nova imagem do CDN
 */
export async function removeNewImageFromCDN(
  imageUrl: string
): Promise<ActionResult<void>> {
  try {
    if (!imageUrl) {
      return { success: true, data: undefined };
    }

    const imageFileKey = getImageKeyFromUrl(imageUrl);

    if (imageFileKey) {
      await utapi.deleteFiles(imageFileKey);
    }

    return { success: true, data: undefined };
  } catch (error) {
    console.error("[removeNewImageFromCDN] Error:", error);
    return {
      success: false,
      error: "Erro ao remover imagem",
    };
  }
}
