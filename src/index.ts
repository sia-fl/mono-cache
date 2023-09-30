import { BaseCacheType, CacheGet, CacheOptions, CachePaths } from './type';
import { MemoryCache } from './cache';
export * from './type';

let client: BaseCacheType = new MemoryCache();

const cache = <T extends Object>(options?: CacheOptions) => {
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
    get: <T2>(key: CachePaths<T>) => {
      return inlineClient.get(key) as CacheGet<T, T2>;
    },
    set: (key: CachePaths<T>, val: any) => inlineClient.set(key, val),
    del: (key: CachePaths<T>) => inlineClient.del(key),
    ttl: (key: CachePaths<T>, ttl: number) => inlineClient.ttl(key, ttl),
    increment: (key: CachePaths<T>, val: number) => inlineClient.increment(key, val),
    decrement: (key: CachePaths<T>, val: number) => inlineClient.decrement(key, val)
  };
};

export default cache;
