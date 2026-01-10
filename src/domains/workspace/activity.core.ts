import { prisma } from "~/lib/server/db";
import type { CreateActivityLogData } from "./activity.types";

/**
 * CORE do domínio
 * - Não faz auth
 * - Não faz access check
 * - Assume dados válidos
 */
export async function createActivityLogCore(
  data: CreateActivityLogData & { userEmail?: string | null }
): Promise<string> {
  const log = await (prisma as any).auditLog.create({
    data: {
      workspaceId: data.workspaceId,
      userId: data.userId,
      userEmail: data.userEmail || null,
      action: data.action,
      entityType: data.entityType,
      entityId: data.entityId || null,
      metadata: data.metadata || null,
    },
  });

  return log.id;
}
