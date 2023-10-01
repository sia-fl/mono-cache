import { BaseCacheType, CacheGet, CacheOptions, CachePaths } from './type';
import { MemoryCache } from './cache';
export * from './type';

let client: BaseCacheType = new MemoryCache();

const cache = <T extends Object = object>(options?: CacheOptions) => {
  let inlineClient: BaseCacheType<T> = client;
  if (!options) {
    options = {};
  }
  options.type = options.type || 'memory';
  options.namespace = options.namespace || 'default';
  if (options.type === 'memory') {
    if (options.namespace !== 'default') {
      inlineClient = new MemoryCache();
    }
  }
  return {
    get: <T2>(key: string | CachePaths<T>) => {
      return inlineClient.get(key as any) as CacheGet<T, T2>;
    },
    set: (key: string | CachePaths<T>, val: any, ttl?: number) =>
      inlineClient.set(key as any, val, ttl),
    del: (key: string | CachePaths<T>) => inlineClient.del(key as any),
    ttl: (key: string | CachePaths<T>, ttl: number) => inlineClient.ttl(key as any, ttl),
    increment: (key: string | CachePaths<T>, val: number) =>
      inlineClient.increment(key as any, val),
    decrement: (key: string | CachePaths<T>, val: number) => inlineClient.decrement(key as any, val)
  };
};

export default cache;
