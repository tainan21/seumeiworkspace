"use server";

import { cache } from "react";
import { revalidateTag, revalidatePath } from "next/cache";
import type { CacheConfig } from "./cache-strategies";

/**
 * Cache em memória simples
 * Para cache mais robusto, considerar Redis ou similar
 */
const memoryCache = new Map<string, { data: unknown; expiresAt: number; tags?: string[] }>();

/**
 * Limpa cache expirado periodicamente
 */
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of memoryCache.entries()) {
    if (value.expiresAt < now) {
      memoryCache.delete(key);
    }
  }
}, 60000); // Limpar a cada minuto

/**
 * Obtém valor do cache
 */
export function getCache<T>(key: string): T | null {
  const cached = memoryCache.get(key);

  if (!cached) {
    return null;
  }

  if (cached.expiresAt < Date.now()) {
    memoryCache.delete(key);
    return null;
  }

  return cached.data as T;
}

/**
 * Define valor no cache
 */
export function setCache<T>(
  key: string,
  data: T,
  config?: CacheConfig
): void {
  const ttl = config?.ttl || 300; // Default 5 minutos
  const expiresAt = Date.now() + ttl * 1000;

  memoryCache.set(key, {
    data,
    expiresAt,
    tags: config?.tags,
  });
}

/**
 * Remove valor do cache
 */
export function invalidateCache(key: string): void {
  memoryCache.delete(key);
}

/**
 * Invalida cache por tag
 */
export function invalidateCacheByTag(tag: string): void {
  for (const [key, value] of memoryCache.entries()) {
    if (value.tags?.includes(tag)) {
      memoryCache.delete(key);
    }
  }

  // Também revalidar tags do Next.js
  revalidateTag(tag, {});
}

/**
 * Invalida cache por path
 */
export function invalidateCacheByPath(path: string): void {
  revalidatePath(path);
}

/**
 * Limpa todo o cache
 */
export function clearCache(): void {
  memoryCache.clear();
}

/**
 * Wrapper para funções com cache
 * Usa React cache() para deduplicação de requests
 */
export function withCache<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  keyGenerator: (...args: Parameters<T>) => string,
  config?: CacheConfig
): T {
  const cachedFn = cache(async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    const key = keyGenerator(...args);

    // Verificar cache em memória
    const cached = getCache<Awaited<ReturnType<T>>>(key);
    if (cached !== null) {
      return cached;
    }

    // Executar função
    const result = await fn(...args);

    // Armazenar no cache
    setCache(key, result, config);

    return result;
  });

  return cachedFn as T;
}
