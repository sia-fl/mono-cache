import { describe, it, expect } from 'vitest';
import cache, { CacheType, KvCacheType } from './index';

interface TestCacheState {
  aa: number;
  bb: number;
  cc: {
    dd: number;
  };
  ee: {
    ff: number[];
  };
}

const testGet = (c: CacheType<TestCacheState>) => {
  const getA = c.get('aa');
  expect(getA).toBe(undefined);
  c.set('bb', 1);
  const getB = c.get('bb');
  expect(getB).toBe(1);
  c.set('cc.dd', 2);
  const getC = c.get('cc');
  expect(getC).toEqual({ dd: 2 });
  const getCD = c.get('cc.dd');
  expect(getCD).toBe(2);
  c.set('ee.ff', [1, 2, 3]);
  const getEF = c.get('ee.ff');
  expect(getEF).toEqual([1, 2, 3]);
};

const testTtl = async (c: CacheType<TestCacheState>) => {
  c.set('aa', 1, 1000 * 2);
  const getA = c.get('aa');
  expect(getA).toBe(1);
  await new Promise(resolve => {
    setTimeout(() => {
      const getA = c.get('aa');
      expect(getA).toBe(undefined);
      resolve(undefined);
    }, 3000);
  });
};

describe('cache', () => {
  it('memory get', () => {
    const c = cache<TestCacheState>().makeSafe();
    testGet(c);
  });

  it('memory namespace', () => {
    const defaultCache = cache<TestCacheState>().makeSafe();
    const testCache = cache<TestCacheState>({ namespace: 'test' }).makeSafe();
    defaultCache.set('aa', 1);
    testCache.set('aa', 2);
    const getA = defaultCache.get('aa');
    expect(getA).toBe(1);
    const getTestA = testCache.get('aa');
    expect(getTestA).toBe(2);
  });

  it('memory ttl', async () => {
    const c = cache<TestCacheState>().makeSafe();
    await testTtl(c);
  });

  it('memory increment', () => {
    const c = cache<TestCacheState>().makeSafe();
    c.set('aa', 1);
    c.increment('aa', 1);
    const getA = c.get('aa');
    expect(getA).toBe(2);
  });

  it('memory decrement', () => {
    const c = cache<TestCacheState>().makeSafe();
    c.set('aa', 1);
    c.decrement('aa', 1);
    const getA = c.get('aa');
    expect(getA).toBe(0);
  });
});

const testKvGet = (c: KvCacheType<TestCacheState>) => {
  const getA = c.get('aa');
  expect(getA).toBe(undefined);
  c.set('bb', 1);
  const getB = c.get('bb');
  expect(getB).toBe(1);
};

describe('kv cache', () => {
  it('kv get', () => {
    const c = cache<TestCacheState>().makeKvSafe();
    testKvGet(c);
  });

  it('kv namespace', () => {
    const defaultCache = cache<TestCacheState>().makeKvSafe();
    const testCache = cache<TestCacheState>({ namespace: 'test' }).makeKvSafe();
    defaultCache.set('aa', 1);
    testCache.set('aa', 2);
    const getA = defaultCache.get('aa');
    expect(getA).toBe(1);
    const getTestA = testCache.get('aa');
    expect(getTestA).toBe(2);
  });

  it('kv ttl', async () => {
    const c = cache<TestCacheState>().makeKvSafe();
    await testTtl(c);
  });

  it('kv increment', () => {
    const c = cache<TestCacheState>().makeKvSafe();
    c.set('aa', 1);
    c.increment('aa', 1);
    const getA = c.get('aa');
    expect(getA).toBe(2);
  });

  it('kv decrement', () => {
    const c = cache<TestCacheState>().makeKvSafe();
    c.set('aa', 1);
    c.decrement('aa', 1);
    const getA = c.get('aa');
    expect(getA).toBe(0);
  });
});
