import { BaseCacheType } from './type';

const splitKey = (key: string) => key.split('.');

class BaseCache {
  protected data: Record<string, any> = {};
}

class MemoryCache extends BaseCache implements BaseCacheType {
  private ttlRecord: Record<string, number> = {};

  constructor() {
    super();
    setInterval(() => {
      const now = Date.now();
      for (const key in this.ttlRecord) {
        if (this.ttlRecord[key] < now) {
          this.del(key);
        }
      }
    }, 1000);
  }

  get = ((key: string) => {
    const keys = splitKey(key);
    let val = this.data;
    for (const k of keys) {
      if (val === undefined) {
        return undefined;
      }
      val = val[k];
    }
    return val;
  }) as any;

  set(key: string, val: any, ttl?: number): void {
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

  del(key: string): boolean {
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

  ttl(key: string, ttl: number) {
    this.ttlRecord[key] = Date.now() + ttl;
  }

  decrement(key: string, val: number): void {
    const old = this.get(key);
    if (old === undefined) {
      this.set(key, val);
    } else {
      if (typeof old !== 'number') {
        throw new Error('old val must be number');
      }
      this.set(key, old - val);
    }
  }

  increment(key: string, val: number): void {
    const old = this.get(key);
    if (old === undefined) {
      this.set(key, val);
    } else {
      if (typeof old !== 'number') {
        throw new Error('old val must be number');
      }
      this.set(key, old + val);
    }
  }
}

export { MemoryCache };
