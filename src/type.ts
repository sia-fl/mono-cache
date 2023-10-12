import { RedisConfigNodejs } from '@upstash/redis';

type GenNode<K extends string | number, IsRoot extends boolean> = IsRoot extends true
  ? `${K}`
  : `.${K}` | (K extends number ? `[${K}]` | `.[${K}]` : never);

export type CachePaths<
  T extends object,
  IsRoot extends boolean = true,
  K extends keyof T = keyof T
> = K extends string
  ?
      | GenNode<K, IsRoot>
      | (T[K] extends Array<any>
          ? never
          : T[K] extends object
          ? `${GenNode<K, IsRoot>}${CachePaths<T[K], false>}`
          : never)
  : never;

export type CacheGet<T, K> = K extends `${infer A}.${infer B}`
  ? A extends keyof T
    ? CacheGet<T[A], B>
    : never
  : K extends keyof T
  ? T[K]
  : never;

export interface CacheBaseType<T, T2 = T> {
  get(key: T): Promise<any>;
  set(key: T, val: any): Promise<'OK' | number>;
  del(key: T): Promise<number>;
  ttl(key: T2, ttl: number): Promise<0 | 1>;
  increment(key: T, val: number): Promise<number>;
  decrement(key: T, val: number): Promise<number>;
}

export type CacheType<T extends object = object, T2 extends object = T> = CacheBaseType<
  CachePaths<T>,
  CachePaths<T2>
>;

export type KvCacheType<T extends object = object> = CacheBaseType<keyof T>;

export interface CacheOptions {
  type?: 'memory' | 'redis' | 'upstash-redis';
  namespace?: string;
  upstashRedisConn?: RedisConfigNodejs;
}
