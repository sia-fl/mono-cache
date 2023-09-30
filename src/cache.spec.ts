import { describe, it, expect } from 'vitest';
import { BaseCacheType } from './type';
import cache from './index';

interface TestCacheState {
  a: number;
  b: number;
  c: {
    d: number;
  };
  e: {
    f: number[];
  };
}

const testCacheGet = (c: BaseCacheType<TestCacheState>) => {
  const getA = c.get('a');
  expect(getA).toBe(undefined);
  c.set('b', 1);
  const getB = c.get('b');
  expect(getB).toBe(1);
  c.set('c.d', 2);
  const getC = c.get('c');
  expect(getC).toEqual({ d: 2 });
  const getCD = c.get('c.d');
  expect(getCD).toBe(2);
  c.set('e.f', [1, 2, 3]);
  const getEF = c.get('e.f');
  expect(getEF).toEqual([1, 2, 3]);
};

describe('cache', () => {
  it('memory get', () => {
    const c = cache<TestCacheState>();
    testCacheGet(c);
  });

  it('memory namespace', () => {
    const defaultCache = cache<TestCacheState>();
    const testCache = cache<TestCacheState>({ namespace: 'test' });
    defaultCache.set('a', 1);
    testCache.set('a', 2);
    const getA = defaultCache.get('a');
    expect(getA).toBe(1);
    const getTestA = testCache.get('a');
    expect(getTestA).toBe(2);
  });
});
