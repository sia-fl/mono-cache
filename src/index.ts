import { CacheBaseType, CacheGet, CacheOptions, CachePaths } from './type';
import { CacheMemory, CacheMemoryKv } from './implement/cache-memory';
import { CacheUpstashRedis, CacheUpstashRedisKv } from './implement/cache-upstash-redis';
export * from './type';

let client = new CacheMemory();
let kvClient = new CacheMemoryKv();

const cache = <T extends Object = object>(options?: CacheOptions) => {
  const methods = <HashKeyType, KeyType>() => {
    let inlineClient: CacheBaseType<HashKeyType> = client as any;
    if (!options) {
      options = {};
    }
    options.type = options.type || 'memory';
    options.namespace = options.namespace || 'default';
    if (options.type === 'memory') {
      if (options.namespace !== 'default') {
        inlineClient = new CacheMemory() as any;
      }
    } else if (options.type === 'upstash-redis') {
      inlineClient = new CacheUpstashRedis(options.upstashRedisConn) as any;
    }
    return {
      get: <T2>(key: HashKeyType) => {
        return inlineClient.get(key as any) as Promise<CacheGet<T, T2>>;
      },
      set: (key: HashKeyType, val: any) => inlineClient.set(key as any, val),
      del: (key: HashKeyType) => inlineClient.del(key as any),
      ttl: (key: KeyType, ttl: number) => inlineClient.ttl(key as any, ttl),
      increment: (key: HashKeyType, val: number) => inlineClient.increment(key as any, val),
      decrement: (key: HashKeyType, val: number) => inlineClient.decrement(key as any, val)
    };
  };

  const kvMethods = <HashKeyType>() => {
    let inlineClientKv: CacheBaseType<HashKeyType> = kvClient as any;
    if (!options) {
      options = {};
    }
    options.type = options.type || 'memory';
    options.namespace = options.namespace || 'default';
    if (options.type === 'memory') {
      if (options.namespace !== 'default') {
        inlineClientKv = new CacheMemoryKv() as any;
      }
    } else if (options.type === 'upstash-redis') {
      inlineClientKv = new CacheUpstashRedisKv(options.upstashRedisConn) as any;
    }
    return {
      get: <T2>(key: HashKeyType) => {
        return inlineClientKv.get(key as any) as Promise<CacheGet<T, T2>>;
      },
      set: (key: HashKeyType, val: any) => inlineClientKv.set(key as any, val),
      del: (key: HashKeyType) => inlineClientKv.del(key as any),
      ttl: (key: HashKeyType, ttl: number) => inlineClientKv.ttl(key as any, ttl),
      increment: (key: HashKeyType, val: number) => inlineClientKv.increment(key as any, val),
      decrement: (key: HashKeyType, val: number) => inlineClientKv.decrement(key as any, val)
    };
  };

  return {
    make() {
      return methods<string | CachePaths<T>, string | keyof T>();
    },
    makeSafe() {
      return methods<CachePaths<T>, keyof T>();
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
