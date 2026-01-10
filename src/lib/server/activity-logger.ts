/**
 * ActivityLogger - Helper para logging automático de atividades
 *
 * Adapter de boundary para o domínio de ActivityLog.
 * ❗ Falhas são silenciosas por design: logging nunca deve quebrar o fluxo principal.
 *
 * ⚠️ NOTA DE DÍVIDA TÉCNICA:
 * O `as any` é TEMPORÁRIO e existe apenas para desacoplar este adapter
 * da tipagem interna do domínio `createActivityLog`.
 */

import { createActivityLog } from "~/domains/workspace/actions/activity.actions";

/**
 * Shape mínimo aceito pelo logger.
 * NÃO é o tipo do domínio — é o contrato do adapter.
 */
export type ActivityLogPayload = {
  workspaceId: string;
  userId: string;
  action: string;
  entityType: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
};

export class ActivityLogger {
  /**
   * Registra uma atividade no sistema.
   * Falhas são silenciosas e não interrompem a operação principal.
   */
  static async log(payload: ActivityLogPayload): Promise<void> {
    try {
      /**
       * Boundary call:
       * - Não validamos profundamente aqui
       * - Não propagamos erro
       * - Não acoplamos este adapter ao domínio
       */
      await createActivityLog(payload as any); // ← TEMPORÁRIO
    } catch (error) {
      /**
       * Logging defensivo: nunca assume shape do erro
       */
      console.error("[ActivityLogger] Failed to log activity", {
        action: payload.action,
        entityType: payload.entityType,
        workspaceId: payload.workspaceId,
        error: error instanceof Error ? error.message : error,
      });
    }
  }

  /**
   * Registra múltiplas atividades.
   *
   * ⚠️ Fire-and-forget intencional:
   * - Não bloqueia o fluxo
   * - Falhas são capturadas internamente
   */
  static logBatch(activities: ActivityLogPayload[]): void {
    void Promise.all(
      activities.map((activity) => ActivityLogger.log(activity))
    ).catch((error) => {
      console.error("[ActivityLogger] Failed to log batch", {
        count: activities.length,
        error: error instanceof Error ? error.message : error,
      });
    });
  }
}
