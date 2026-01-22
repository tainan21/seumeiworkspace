/**
 * Estratégias de cache
 */

export type CacheStrategy = "no-cache" | "cache-first" | "stale-while-revalidate" | "network-first";

/**
 * Configuração de cache por recurso
 */
export interface CacheConfig {
  strategy: CacheStrategy;
  ttl?: number; // Time to live em segundos
  tags?: string[]; // Tags para invalidação seletiva
}

/**
 * Estratégias padrão por tipo de recurso
 */
export const CACHE_STRATEGIES: Record<string, CacheConfig> = {
  workspace: {
    strategy: "stale-while-revalidate",
    ttl: 300, // 5 minutos
    tags: ["workspace"],
  },
  projects: {
    strategy: "cache-first",
    ttl: 60, // 1 minuto
    tags: ["projects", "workspace"],
  },
  features: {
    strategy: "stale-while-revalidate",
    ttl: 600, // 10 minutos
    tags: ["features", "workspace"],
  },
  user: {
    strategy: "cache-first",
    ttl: 300,
    tags: ["user"],
  },
};

/**
 * Determina estratégia de cache baseado no tipo de recurso
 */
export function getCacheStrategy(resourceType: string): CacheConfig {
  return CACHE_STRATEGIES[resourceType] || {
    strategy: "no-cache",
  };
}
