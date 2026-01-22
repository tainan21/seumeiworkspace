"use server";

import { getCurrentSession } from "~/lib/server/auth/session";
import { checkRateLimit, RATE_LIMIT_CONFIGS, type RateLimitConfig } from "./rate-limiter";
import { RateLimitError } from "../errors/error-types";

/**
 * Middleware de rate limiting para Server Actions
 */
export function withRateLimit(
  config: RateLimitConfig | string = "default"
) {
  return function <Args extends any[], Return>(
    action: (...args: Args) => Promise<Return>
  ) {
    return async (...args: Args): Promise<Return> => {
      const session = await getCurrentSession();
      const userId = session.user?.id || "anonymous";

      // Usar configuração padrão se string fornecida
      const limitConfig =
        typeof config === "string"
          ? RATE_LIMIT_CONFIGS[config] || RATE_LIMIT_CONFIGS.default
          : config;

      // Criar identificador (userId + nome da ação)
      const identifier = `${userId}:${action.name}`;

      const result = checkRateLimit(identifier, limitConfig);

      if (!result.allowed) {
        const resetIn = Math.ceil((result.resetAt - Date.now()) / 1000);
        throw new RateLimitError(
          `Rate limit excedido. Tente novamente em ${resetIn} segundos.`,
          limitConfig.maxRequests,
          result.remaining
        );
      }

      return await action(...args);
    };
  };
}

/**
 * Rate limit por IP (para uso em API routes)
 */
export async function checkRateLimitByIP(
  ip: string,
  config: RateLimitConfig | string = "default"
): Promise<{ allowed: boolean; remaining: number }> {
  const limitConfig =
    typeof config === "string"
      ? RATE_LIMIT_CONFIGS[config] || RATE_LIMIT_CONFIGS.default
      : config;

  const result = checkRateLimit(`ip:${ip}`, limitConfig);

  return {
    allowed: result.allowed,
    remaining: result.remaining,
  };
}
