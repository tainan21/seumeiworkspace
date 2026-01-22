"use server";

/**
 * Rate limiting simples em memória
 * Para produção, considerar Redis ou serviço dedicado
 */
const rateLimitStore = new Map<
  string,
  { count: number; resetAt: number }
>();

/**
 * Limpa rate limits expirados
 */
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (value.resetAt < now) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); // Limpar a cada minuto

/**
 * Configuração de rate limit
 */
export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number; // Janela de tempo em milissegundos
}

/**
 * Verifica se request está dentro do limite
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const stored = rateLimitStore.get(identifier);

  if (!stored || stored.resetAt < now) {
    // Criar novo registro
    const resetAt = now + config.windowMs;
    rateLimitStore.set(identifier, {
      count: 1,
      resetAt,
    });

    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetAt,
    };
  }

  // Incrementar contador
  stored.count++;

  if (stored.count > config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: stored.resetAt,
    };
  }

  rateLimitStore.set(identifier, stored);

  return {
    allowed: true,
    remaining: config.maxRequests - stored.count,
    resetAt: stored.resetAt,
  };
}

/**
 * Configurações padrão por tipo de ação
 */
export const RATE_LIMIT_CONFIGS: Record<string, RateLimitConfig> = {
  default: {
    maxRequests: 100,
    windowMs: 60000, // 1 minuto
  },
  createWorkspace: {
    maxRequests: 3,
    windowMs: 3600000, // 1 hora
  },
  createProject: {
    maxRequests: 10,
    windowMs: 60000, // 1 minuto
  },
  activateFeature: {
    maxRequests: 20,
    windowMs: 60000,
  },
  purchaseFeature: {
    maxRequests: 5,
    windowMs: 60000,
  },
};
