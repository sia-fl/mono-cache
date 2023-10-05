import { BaseCacheType, CacheGet, CacheOptions, CachePaths } from './type';
import { MemoryCache, MemoryKvCache } from './cache';
export * from './type';

let client = new MemoryCache();
let kvClient = new MemoryKvCache();

const cache = <T extends Object = object>(options?: CacheOptions) => {
  const methods = <KeyType>() => {
    let inlineClient: BaseCacheType<KeyType> = client as any;
    if (!options) {
      options = {};
    }
    options.type = options.type || 'memory';
    options.namespace = options.namespace || 'default';
    if (options.type === 'memory') {
      if (options.namespace !== 'default') {
        inlineClient = new MemoryCache() as any;
      }
    }
    return {
      get: <T2>(key: KeyType) => {
        return inlineClient.get(key as any) as CacheGet<T, T2>;
      },
      set: (key: KeyType, val: any, ttl?: number) => inlineClient.set(key as any, val, ttl),
      del: (key: KeyType) => inlineClient.del(key as any),
      ttl: (key: KeyType, ttl: number) => inlineClient.ttl(key as any, ttl),
      increment: (key: KeyType, val: number, ttl?: number) =>
        inlineClient.increment(key as any, val, ttl),
      decrement: (key: KeyType, val: number, ttl?: number) =>
        inlineClient.decrement(key as any, val, ttl)
    };
  };

  const kvMethods = <KeyType>() => {
    let inlineClientKv: BaseCacheType<KeyType> = kvClient as any;
    if (!options) {
      options = {};
    }
    options.type = options.type || 'memory';
    options.namespace = options.namespace || 'default';
    if (options.type === 'memory') {
      if (options.namespace !== 'default') {
        inlineClientKv = new MemoryKvCache() as any;
      }
    }
    return {
      get: <T2>(key: KeyType) => {
        return inlineClientKv.get(key as any) as CacheGet<T, T2>;
      },
      set: (key: KeyType, val: any, ttl?: number) => inlineClientKv.set(key as any, val, ttl),
      del: (key: KeyType) => inlineClientKv.del(key as any),
      ttl: (key: KeyType, ttl: number) => inlineClientKv.ttl(key as any, ttl),
      increment: (key: KeyType, val: number, ttl?: number) =>
        inlineClientKv.increment(key as any, val, ttl),
      decrement: (key: KeyType, val: number, ttl?: number) =>
        inlineClientKv.decrement(key as any, val, ttl)
    };
  };

  return {
    make() {
      return methods<string | CachePaths<T>>();
    },
    makeSafe() {
      return methods<CachePaths<T>>();
    },
    makeKv() {
      return kvMethods<string | keyof T>();
    },
    makeKvSafe() {
      return kvMethods<keyof T>();
    }
  };
};

export default cache;
