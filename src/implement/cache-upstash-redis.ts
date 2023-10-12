import { Redis, RedisConfigNodejs } from '@upstash/redis';
import { CacheBaseType } from '../type';
import { keyCheck, splitKey } from '../util';

class CacheBaseRedis {
  redis: Redis;

  constructor(options: RedisConfigNodejs) {
    this.redis = new Redis(options);
  }
}

class CacheUpstashRedis<T extends string> extends CacheBaseRedis implements CacheBaseType<T> {
  async del(key: T): Promise<number> {
    if (key.indexOf('.') === -1) {
      return await this.redis.del(key);
    }
    const [hKey, hFields] = splitKey(key);
    return await this.redis.hdel(hKey, hFields);
  }

  async get(key: T): Promise<any> {
    let result: unknown;
    if (key.indexOf('.') === -1) {
      result = await this.redis.hgetall(key);
    } else {
      const [hKey, hFields] = splitKey(key);
      result = await this.redis.hget(hKey, hFields);
    }

    if (result === null) {
      return undefined;
    }
    return result;
  }

  async set(key: T, val: any): Promise<'OK' | number> {
    if (key.indexOf('.') === -1) {
      return await this.redis.hmset(key, val);
    }
    const [hKey, hFields] = splitKey(key);
    return await this.redis.hset(hKey, {
      [hFields]: val
    });
  }

  async ttl(key: string, ttl: number): Promise<0 | 1> {
    return await this.redis.pexpire(key as string, ttl);
  }

  async increment(key: T, val: number = 1): Promise<number> {
    keyCheck(key);
    const [hKey, hFields] = splitKey(key);
    return await this.redis.hincrby(hKey, hFields, val);
  }

  async decrement(key: T, val: number = 1): Promise<number> {
    keyCheck(key);
    const [hKey, hFields] = splitKey(key);
    return await this.redis.hincrby(hKey, hFields, -val);
  }
}

class CacheUpstashRedisKv<T extends string> extends CacheBaseRedis implements CacheBaseType<T> {
  async del(key: T): Promise<number> {
    return await this.redis.del(key);
  }

  async get(key: T): Promise<any> {
    const result = await this.redis.get(key);
    if (result === null) {
      return undefined;
    }
    return result;
  }

  async set(key: T, val: any): Promise<'OK' | number> {
    return await this.redis.set(key, val);
  }

  async ttl(key: string, ttl: number): Promise<0 | 1> {
    return await this.redis.pexpire(key as string, ttl);
  }

  async increment(key: T, val: number = 1): Promise<number> {
    return await this.redis.incrby(key, val);
  }

  async decrement(key: T, val: number = 1): Promise<number> {
    return await this.redis.decrby(key, val);
  }
}

export { CacheUpstashRedis, CacheUpstashRedisKv };
