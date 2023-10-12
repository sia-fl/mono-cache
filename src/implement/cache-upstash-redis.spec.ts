import { describe, it, expect, beforeAll } from 'vitest';
import cache, { CacheOptions, CacheType, KvCacheType } from '../index';
import { config } from 'dotenv';
import * as path from 'path';

config({
  path: path.join(__dirname, '../../.env')
});

interface TestCacheState {
  user: {
    age: number;
    name: string;
  };
  code: {
    code1: string;
    code2: string;
  };
}

interface TestCacheState2 {
  age: number;
  name: string;
}

const testGet = async (c: CacheType<TestCacheState>) => {
  expect(await c.get('user.age')).toBe(undefined);
  await c.set('user.age', 1);
  expect(await c.get('user.age')).toBe(1);
  await c.set('user.age', 2);
  expect(await c.get('user.age')).toBe(2);
};

const testTtl = async (c: CacheType<TestCacheState>) => {
  await c.set('user.age', 1);
  await c.ttl('user', 3000);
  expect(await c.get('user.age')).toBe(1);
  await new Promise(resolve => {
    setTimeout(async () => {
      expect(await c.get('user.age')).toBe(undefined);
      resolve(undefined);
    }, 3000);
  });
};

const getCache = <T>(options?: CacheOptions) => {
  return cache<T>({
    type: 'upstash-redis',
    upstashRedisConn: {
      url: process.env['UPSTASH_REDIS_REST_URL'],
      token: process.env['UPSTASH_REDIS_REST_TOKEN']
    },
    ...options
  });
};

describe('upstash redis cache', () => {
  beforeAll(async () => {
    const c = getCache<TestCacheState>().makeSafe();
    await c.del('user');
    await c.del('code');
  });

  it('upstash redis get', async () => {
    const c = getCache<TestCacheState>().makeSafe();
    await testGet(c);
  });

  it('upstash redis ttl', async () => {
    const c = getCache<TestCacheState>().makeSafe();
    await testTtl(c);
  });

  it('upstash redis increment', async () => {
    const c = getCache<TestCacheState>().make();
    await c.set('user.age', 1);
    await c.increment('user.age', 1);
    expect(await c.get('user.age')).toBe(2);
  });

  it('upstash redis decrement', async () => {
    const c = getCache<TestCacheState>().make();
    await c.set('user.age', 1);
    await c.decrement('user.age', 1);
    expect(await c.get('user.age')).toBe(0);
  });
});

const testKvGet = async (c: KvCacheType<TestCacheState2>) => {
  const result = await c.get('age');
  expect(result).toBe(undefined);
  await c.set('age', 1);
  expect(await c.get('age')).toBe(1);
};

const testKvTtl = async (c: CacheType<TestCacheState2>) => {
  await c.set('age', 1);
  await c.ttl('age', 3000);
  expect(await c.get('age')).toBe(1);
  await new Promise(resolve => {
    setTimeout(async () => {
      try {
        const result = await c.get('age').catch(() => {
          return undefined;
        });
        expect(result).toBe(undefined);
      } catch (error) {}
      resolve(undefined);
    }, 3000);
  });
};

describe('upstash redis kv cache', () => {
  beforeAll(async () => {
    const c = getCache<TestCacheState2>().makeKvSafe();
    await c.del('age');
    await c.del('name');
  });

  it('upstash redis kv get', async () => {
    const c = getCache<TestCacheState2>().makeKvSafe();
    await testKvGet(c);
  });

  it('upstash redis kv ttl', async () => {
    const c = getCache<TestCacheState2>().makeKvSafe();
    await testKvTtl(c);
  });

  it('upstash redis kv increment', async () => {
    const c = getCache<TestCacheState2>().makeKv();
    await c.set('age', 1);
    await c.increment('age', 1);
    expect(await c.get('age')).toBe(2);
  });

  it('upstash redis kv decrement', async () => {
    const c = getCache<TestCacheState2>().makeKv();
    await c.set('age', 1);
    await c.decrement('age', 1);
    expect(await c.get('age')).toBe(0);
  });
});
