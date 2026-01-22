"use server";

import { getAuditLogs } from "~/lib/audit/audit-service";
import type { AuditLogFilters } from "~/lib/audit/audit-service";

/**
 * Busca logs de auditoria
 */
export async function getAuditLogsAction(filters: AuditLogFilters = {}) {
  try {
    return await getAuditLogs(filters);
  } catch (error) {
    console.error("[getAuditLogsAction] Error:", error);
    return {
      events: [],
      total: 0,
      page: 1,
      totalPages: 0,
    };
  }
}
