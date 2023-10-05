import { BaseCacheType, CachePaths } from './type';

const splitKey = (key: string) => key.split('.');

class BaseCache {
  protected data: Record<string, any> = {};
}

class MemoryBaseCache extends BaseCache {
  protected ttlRecord: Record<string, number> = {};

  constructor() {
    super();
    setInterval(() => {
      const now = Date.now();
      for (const key in this.ttlRecord) {
        if (this.ttlRecord[key] < now) {
          // @ts-ignore
          this.del(key);
        }
      }
    }, 1000);
  }
}

class MemoryCache<T extends string> extends MemoryBaseCache implements BaseCacheType<T> {
  get(key: string | CachePaths<object>): any {
    const keys = splitKey(key);
    let val = this.data;
    for (const k of keys) {
      if (val === undefined) {
        return undefined;
      }
      val = val[k];
    }
    return val;
  }

  set(key: string | CachePaths<object>, val: any, ttl?: number): any {
    if (ttl) {
      this.ttlRecord[key] = Date.now() + ttl;
    }
    const keys = splitKey(key);
    let data = this.data;
    for (let i = 0; i < keys.length; i++) {
      const k = keys[i];
      if (data[k] === undefined || typeof data[k] !== 'object') {
        data[k] = {};
      }
      if (i === keys.length - 1) {
        data[k] = val;
      } else {
        data = data[k];
      }
    }
  }

  del(key: string | CachePaths<object>): boolean {
    const keys = splitKey(key);
    let data = this.data;
    for (let i = 0; i < keys.length; i++) {
      const k = keys[i];
      if (i === keys.length - 1) {
        delete data[k];
        continue;
      }
      if (typeof data[k] === 'object') {
        data = data[k];
      } else {
        return false;
      }
    }
    return true;
  }

  ttl(key: string | CachePaths<object>, ttl: number): void {
    this.ttlRecord[key] = Date.now() + ttl;
  }

  decrement(key: string | CachePaths<object>, val: number, ttl?: number): void {
    const old = this.get(key);
    if (old === undefined) {
      this.set(key, val);
    } else {
      if (typeof old !== 'number') {
        throw new Error('old val must be number');
      }
      this.set(key, old - val, ttl);
    }
  }

  increment(key: string | CachePaths<object>, val: number, ttl?: number): void {
    const old = this.get(key);
    if (old === undefined) {
      this.set(key, val);
    } else {
      if (typeof old !== 'number') {
        throw new Error('old val must be number');
      }
      this.set(key, old + val, ttl);
    }
  }
}

class MemoryKvCache<T extends string> extends MemoryBaseCache implements BaseCacheType<T> {
  get(key: T): any {
    return this.data[key];
  }

  set(key: T, val: any, ttl?: number): any {
    if (ttl) {
      this.ttlRecord[key] = Date.now() + ttl;
    }
    this.data[key] = val;
  }

  ttl(key: T, ttl: number): void {
    this.ttlRecord[key] = Date.now() + ttl;
  }

  del(key: T): void {
    delete this.data[key];
  }

  increment(key: T, val: number, ttl?: number): void {
    const old = this.get(key);
    if (old === undefined) {
      this.set(key, val);
    } else {
      if (typeof old !== 'number') {
        throw new Error('old val must be number');
      }
      this.set(key, old + val, ttl);
    }
  }

  decrement(key: T, val: number, ttl?: number): void {
    const old = this.get(key);
    if (old === undefined) {
      this.set(key, val);
    } else {
      if (typeof old !== 'number') {
        throw new Error('old val must be number');
      }
      this.set(key, old - val, ttl);
    }
  }
}

export { MemoryCache, MemoryKvCache };
