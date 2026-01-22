import type { LogLevel, LogContext, LogEntry } from "./logger.types";

/**
 * Contexto global do logger
 */
let globalContext: LogContext = {};

/**
 * Define contexto global do logger
 */
export function setLoggerContext(context: LogContext): void {
  globalContext = { ...globalContext, ...context };
}

/**
 * Limpa contexto global
 */
export function clearLoggerContext(): void {
  globalContext = {};
}

/**
 * Formata log para exibição
 */
function formatLog(entry: LogEntry): string {
  const timestamp = entry.timestamp.toISOString();
  const contextStr = entry.context
    ? ` ${JSON.stringify(entry.context)}`
    : "";
  const errorStr = entry.error
    ? `\n${entry.error.stack || entry.error.message}`
    : "";

  return `[${timestamp}] [${entry.level.toUpperCase()}] ${entry.message}${contextStr}${errorStr}`;
}

/**
 * Logger estruturado com contexto
 */
export const logger = {
  debug(message: string, context?: LogContext): void {
    if (process.env.NODE_ENV === "development") {
      const entry: LogEntry = {
        level: "debug",
        message,
        context: { ...globalContext, ...context },
        timestamp: new Date(),
      };
      console.debug(formatLog(entry));
    }
  },

  info(message: string, context?: LogContext): void {
    const entry: LogEntry = {
      level: "info",
      message,
      context: { ...globalContext, ...context },
      timestamp: new Date(),
    };
    console.info(formatLog(entry));
  },

  warn(message: string, context?: LogContext): void {
    const entry: LogEntry = {
      level: "warn",
      message,
      context: { ...globalContext, ...context },
      timestamp: new Date(),
    };
    console.warn(formatLog(entry));
  },

  error(message: string, error?: Error, context?: LogContext): void {
    const entry: LogEntry = {
      level: "error",
      message,
      context: { ...globalContext, ...context },
      timestamp: new Date(),
      error,
    };
    console.error(formatLog(entry));

    // TODO: Enviar para serviço de monitoramento (Sentry, etc)
  },
};
