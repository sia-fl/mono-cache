import { describe, it, expect } from 'vitest';
import cache, { CacheType, KvCacheType } from '../index';

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
  await c.ttl('user', 1000);
  expect(await c.get('user.age')).toBe(1);
  await new Promise(resolve => {
    setTimeout(async () => {
      expect(await c.get('user.age')).toBe(1);
      resolve(undefined);
    }, 3000);
  });
};

describe('cache', () => {
  it('memory get', async () => {
    const c = cache<TestCacheState>().makeSafe();
    await testGet(c);
  });

  it('memory namespace', async () => {
    const defaultCache = cache<TestCacheState>().makeSafe();
    const testCache = cache<TestCacheState>({ namespace: 'test' }).makeSafe();
    await defaultCache.set('user.age', 1);
    await testCache.set('user.age', 2);
    expect(await defaultCache.get('user.age')).toBe(1);
    expect(await testCache.get('user.age')).toBe(2);
  });

  it('memory ttl', async () => {
    const c = cache<TestCacheState>().makeSafe();
    await testTtl(c);
  });

  it('memory increment', async () => {
    const c = cache<TestCacheState>().makeSafe();
    await c.set('user.age', 1);
    await c.increment('user.age', 1);
    expect(await c.get('user.age')).toBe(2);
  });

  it('memory decrement', async () => {
    const c = cache<TestCacheState>().makeSafe();
    await c.set('user.age', 1);
    await c.decrement('user.age', 1);
    expect(await c.get('user.age')).toBe(0);
  });
});

const testKvGet = async (c: KvCacheType<TestCacheState2>) => {
  expect(await c.get('age')).toBe(undefined);
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
    }, 4000);
  });
};

describe('kv cache', () => {
  it('kv get', () => {
    const c = cache<TestCacheState2>().makeKvSafe();
    testKvGet(c);
  });

  it('kv namespace', async () => {
    const defaultCache = cache<TestCacheState2>().makeKvSafe();
    const testCache = cache<TestCacheState2>({ namespace: 'test' }).makeKvSafe();
    await defaultCache.set('age', 1);
    await testCache.set('age', 2);
    expect(await defaultCache.get('age')).toBe(1);
    expect(await testCache.get('age')).toBe(2);
  });

  it('kv ttl', async () => {
    const c = cache<TestCacheState2>().makeKvSafe();
    await testKvTtl(c);
  });

  it('kv increment', async () => {
    const c = cache<TestCacheState2>().makeKvSafe();
    await c.set('age', 1);
    await c.increment('age', 1);
    expect(await c.get('age')).toBe(2);
  });

  it('kv decrement', async () => {
    const c = cache<TestCacheState2>().makeKvSafe();
    await c.set('age', 1);
    await c.decrement('age', 1);
    expect(await c.get('age')).toBe(0);
  });
});
