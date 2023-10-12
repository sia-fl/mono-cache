import { CacheBaseType } from '../type';
import { keyCheck, splitKey } from '../util';

class CacheBaseMemory {
  protected data: Record<string, any> = {};
  protected ttlRecord: Record<string, number> = {};

  constructor() {
    setInterval(() => {
      const now = Date.now();
      for (const key in this.ttlRecord) {
        if (this.ttlRecord[key] < now - 20) {
          // @ts-ignore
          this.del(key);
        }
      }
    }, 1000);
  }

  protected ttlCheck(key: any) {
    if (this.ttlRecord[key]) {
      return this.ttlRecord[key] > Date.now();
    }
    return true;
  }
}

class CacheMemory<T extends string> extends CacheBaseMemory implements CacheBaseType<T> {
  async del(key: T): Promise<number> {
    if (key.indexOf('.') === -1) {
      delete this.data[key];
      delete this.ttlRecord[key];
      return 1;
    }
    const [hKey, hFields] = splitKey(key);
    if (this.data[hKey]) {
      delete this.data[hKey][hFields];
      delete this.ttlRecord[key];
      return 1;
    }
  }

  async get(key: T): Promise<any> {
    if (!this.ttlCheck(key)) {
      return undefined;
    }
    if (key.indexOf('.') === -1) {
      return this.data[key];
    }
    const [hKey, hFields] = splitKey(key);
    if (this.data[hKey]) {
      return this.data[hKey][hFields];
    }
    return undefined;
  }

  async set(key: T, val: any): Promise<'OK' | number> {
    if (this.ttlRecord[key]) {
      delete this.ttlRecord[key];
    }
    if (key.indexOf('.') === -1) {
      if (typeof val === 'object') {
        throw new Error('set: value is not a string');
      }
      Object.values(val).forEach(item => {
        if (typeof item === 'object') {
          throw new Error('set: value cannot be a object');
        }
      });
      this.data[key] = val;
      return Object.keys(this.data).length;
    }
    const [hKey, hFields] = splitKey(key);
    if (!this.data[hKey]) {
      this.data[hKey] = {};
    }
    if (typeof this.data[hKey] !== 'object') {
      throw new Error('set: value is not a object');
    }
    this.data[hKey][hFields] = val;
    return 'OK';
  }

  async increment(key: T, val: number): Promise<number> {
    if (!this.ttlCheck(key)) {
      delete this.ttlRecord[key];
    }
    keyCheck(key);
    const [hKey, hFields] = splitKey(key);
    if (this.data[hKey]) {
      if (typeof this.data[hKey] !== 'object') {
        throw new Error('increment: value is not a object');
      }
      if (typeof this.data[hKey][hFields] !== 'number') {
        throw new Error('increment: value is not a number');
      }
      this.data[hKey][hFields] += val;
      return this.data[hKey][hFields];
    }
    return 0;
  }

  async decrement(key: T, val: number): Promise<number> {
    if (!this.ttlCheck(key)) {
      delete this.ttlRecord[key];
    }
    keyCheck(key);
    const [hKey, hFields] = splitKey(key);
    if (this.data[hKey]) {
      if (typeof this.data[hKey] !== 'object') {
        throw new Error('decrement: value is not a object');
      }
      if (typeof this.data[hKey][hFields] !== 'number') {
        throw new Error('decrement: value is not a number');
      }
      this.data[hKey][hFields] -= val;
      return this.data[hKey][hFields];
    }
    return 0;
  }

  async ttl(key: string, ttl: number): Promise<0 | 1> {
    if (this.ttlRecord[key as string]) {
      this.ttlRecord[key as string] = Date.now() + ttl;
      return 1;
    }
    return 0;
  }
}

class CacheMemoryKv<T extends string> extends CacheBaseMemory implements CacheBaseType<T> {
  async decrement(key: T, val: number): Promise<number> {
    if (!this.ttlCheck(key)) {
      delete this.ttlRecord[key];
    }
    if (typeof this.data[key] !== 'number') {
      throw new Error('decrement: value is not a number');
    }
    this.data[key] -= val;
    return this.data[key];
  }

  async del(key: T): Promise<number> {
    if (this.data[key]) {
      delete this.data[key];
      delete this.ttlRecord[key];
      return 1;
    }
    return 0;
  }

  async get(key: T): Promise<any> {
    if (!this.ttlCheck(key)) {
      return null;
    }
    return this.data[key];
  }

  async increment(key: T, val: number): Promise<number> {
    if (!this.ttlCheck(key)) {
      delete this.ttlRecord[key];
    }
    if (typeof this.data[key] !== 'number') {
      throw new Error('increment: value is not a number');
    }
    this.data[key] += val;
    return this.data[key];
  }

  async set(key: T, val: any, ttl?: number): Promise<'OK' | number> {
    if (ttl) {
      this.ttlRecord[key] = Date.now() + ttl;
    } else if (this.ttlRecord[key]) {
      delete this.ttlRecord[key];
    }
    if (typeof val !== 'string' && typeof val !== 'number') {
      throw new Error('set: value is not a string or number');
    }
    this.data[key] = val;
    return 'OK';
  }

  async ttl(key: string, ttl: number): Promise<0 | 1> {
    if (this.ttlRecord[key as string]) {
      this.ttlRecord[key as string] = Date.now() + ttl;
      return 1;
    }
    this.ttlRecord[key as string] = Date.now() + ttl;
  }
}

export { CacheMemory, CacheMemoryKv };
