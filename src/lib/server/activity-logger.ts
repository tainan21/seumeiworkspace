/**
 * ActivityLogger - Helper para logging automático de atividades
 * 
 * Adapter que facilita criar logs em outras partes do sistema
 * Falhas são silenciosas para não quebrar a operação principal
 */

import { createActivityLog } from "~/domains/workspace/actions/activity.actions";

export class ActivityLogger {
  /**
   * Registra uma atividade no sistema
   * 
   * ⚠️ IMPORTANTE: Falhas são silenciosas (apenas console.error)
   * O log não deve quebrar a operação principal do sistema
   * 
   * @param data - Dados da atividade
   * @param data.workspaceId - ID do workspace (obrigatório)
   * @param data.userId - ID do usuário que realizou a ação (obrigatório)
   * @param data.action - Tipo de ação (ex: PROJECT_CREATED)
   * @param data.entityType - Tipo de entidade (ex: PROJECT)
   * @param data.entityId - ID da entidade (opcional)
   * @param data.metadata - Dados adicionais (opcional)
   * 
   * @example
   * await ActivityLogger.log({
   *   workspaceId: 'ws_123',
   *   userId: 'user_456',
   *   action: 'PROJECT_CREATED',
   *   entityType: 'PROJECT',
   *   entityId: 'proj_789',
   *   metadata: { projectName: 'Meu Projeto' },
   * });
   */
  static async log(data: {
    workspaceId: string;
    userId: string;
    action: string;
    entityType: string;
    entityId?: string;
    metadata?: Record<string, any>;
  }): Promise<void> {
    try {
      await createActivityLog(data);
    } catch (error) {
      // Log silenciosamente - não deve quebrar a operação principal
      console.error("[ActivityLogger] Failed to log activity:", {
        action: data.action,
        entityType: data.entityType,
        error: error instanceof Error ? error.message : String(error),
      });
      // NÃO re-throw - silencioso
    }
  }

  /**
   * Registra múltiplas atividades em batch
   * Útil quando uma operação gera múltiplos logs
   * 
   * @param activities - Array de atividades para registrar
   */
  static async logBatch(
    activities: Array<{
      workspaceId: string;
      userId: string;
      action: string;
      entityType: string;
      entityId?: string;
      metadata?: Record<string, any>;
    }>
  ): Promise<void> {
    // Executar em paralelo, mas não aguardar
    Promise.all(activities.map((activity) => this.log(activity))).catch(
      (error) => {
        console.error("[ActivityLogger] Failed to log batch:", error);
      }
    );
  }
}

