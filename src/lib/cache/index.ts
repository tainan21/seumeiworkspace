export {
  getCache,
  setCache,
  invalidateCache,
  invalidateCacheByTag,
  invalidateCacheByPath,
  clearCache,
  withCache,
} from "./cache.service";
export { getCacheStrategy, CACHE_STRATEGIES } from "./cache-strategies";
export type { CacheStrategy, CacheConfig } from "./cache-strategies";
