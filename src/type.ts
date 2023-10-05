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

export interface BaseCacheType<T> {
  get(key: T): any;
  set(key: T, val: any, ttl?: number): any;
  del(key: T): void;
  ttl(key: T, ttl: number): void;
  increment(key: T, val: number, ttl?: number): void;
  decrement(key: T, val: number, ttl?: number): void;
}

export type CacheType<T extends object = object> = BaseCacheType<CachePaths<T>>;

export type KvCacheType<T extends object = object> = BaseCacheType<keyof T>;

export interface CacheOptions {
  type?: 'memory' | 'redis';
  namespace?: string;
}
