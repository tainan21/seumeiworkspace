"use server";

import { DomainError } from "./error-types";
import { logger } from "../logger/logger";

/**
 * Handler centralizado de erros
 * Converte erros em respostas apropriadas
 */
export function handleError(error: unknown): {
  message: string;
  code: string;
  statusCode: number;
  details?: unknown;
} {
  // Erros conhecidos do domínio
  if (error instanceof DomainError) {
    logger.error("Domain error", error, {
      code: error.code,
      statusCode: error.statusCode,
    });

    return {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
    };
  }

  // Erros do Prisma
  if (error && typeof error === "object" && "code" in error) {
    const prismaError = error as { code: string; meta?: unknown };

    if (prismaError.code === "P2002") {
      return {
        message: "Registro já existe",
        code: "DUPLICATE_ERROR",
        statusCode: 409,
      };
    }

    if (prismaError.code === "P2025") {
      return {
        message: "Registro não encontrado",
        code: "NOT_FOUND_ERROR",
        statusCode: 404,
      };
    }
  }

  // Erros genéricos
  const message =
    error instanceof Error ? error.message : "Erro desconhecido";

  logger.error(
    "Unexpected error",
    error instanceof Error ? error : undefined,
    {
      errorString: error instanceof Error ? undefined : String(error),
    }
  );

  return {
    message,
    code: "INTERNAL_ERROR",
    statusCode: 500,
    details: process.env.NODE_ENV === "development" ? error : undefined,
  };
}

/**
 * Wrapper para Server Actions que captura erros
 */
export function withErrorHandling<T extends (...args: any[]) => Promise<any>>(
  fn: T
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error) {
      const handled = handleError(error);
      throw new Error(handled.message);
    }
  }) as T;
}
