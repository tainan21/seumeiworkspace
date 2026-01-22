/**
 * Níveis de log
 */
export type LogLevel = "debug" | "info" | "warn" | "error";

/**
 * Contexto adicional para logs
 */
export interface LogContext {
  workspaceId?: string;
  userId?: string;
  requestId?: string;
  [key: string]: unknown;
}

/**
 * Estrutura de log
 */
export interface LogEntry {
  level: LogLevel;
  message: string;
  context?: LogContext;
  timestamp: Date;
  error?: Error;
}
