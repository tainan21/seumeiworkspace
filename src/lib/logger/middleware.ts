"use server";

import { NextRequest } from "next/server";
import { logger, setLoggerContext, clearLoggerContext } from "./logger";
import { getCurrentSession } from "~/lib/server/auth/session";

/**
 * Middleware para adicionar contexto aos logs
 * Extrai informações da request e adiciona ao contexto global
 */
export async function logRequest(request: NextRequest): Promise<void> {
  const requestId = crypto.randomUUID();
  const pathname = request.nextUrl.pathname;

  // Buscar informações da sessão
  let userId: string | undefined;
  try {
    const session = await getCurrentSession();
    userId = session.user?.id;
  } catch {
    // Ignorar erros de sessão no log
  }

  // Extrair workspaceId dos headers se disponível
  const workspaceId = request.headers.get("x-workspace-id") || undefined;

  // Definir contexto
  setLoggerContext({
    requestId,
    pathname,
    userId,
    workspaceId,
    method: request.method,
  });

  logger.info(`Request: ${request.method} ${pathname}`, {
    requestId,
    pathname,
    method: request.method,
  });
}

/**
 * Limpa contexto após request
 */
export function clearRequestContext(): void {
  clearLoggerContext();
}
