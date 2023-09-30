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

export interface BaseCacheType<T extends object = object> {
  get(key: CachePaths<T>): any;
  set(key: CachePaths<T>, val: any): any;
  del(key: CachePaths<T>): boolean;
  ttl(key: CachePaths<T>, ttl: number): void;
  increment(key: CachePaths<T>, val: number): void;
  decrement(key: CachePaths<T>, val: number): void;
}

type CacheType = 'memory' | 'redis';

export interface CacheOptions {
  type?: CacheType;
  namespace?: string;
}
