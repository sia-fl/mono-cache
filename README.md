# mono-cache <a href="https://npm.im/mono-cache"><img src="https://badgen.net/npm/v/mono-cache"></a> <a href="https://npm.im/mono-cache"><img src="https://badgen.net/npm/dm/mono-cache"></a> <a href="https://packagephobia.now.sh/result?p=mono-cache">

install to npm dependencies :

```
npm i -D mono-cache
```

usage:

```typescript
import cache from 'mono-cache';

interface CacheState {
  name: string;
  age: number;

  next: {
    weight: number;
    height: number;
  };
}

const c = cache<CacheState>();
c.set('name', 'mono-cache');
c.set('age', 18);
c.set('next.weight', 60);
c.set('next.height', 180);

const name = c.get('name');
const age = c.get('age');
const next = c.get('next');
console.log(name, age, next);

// ttl

c.set('name', 'mono-cache', 1000); // 1000 = 1s

// how to get result type on get method ?

import { CachePaths } from './type';

const nextPaths: CachePaths<CacheState> = 'next';
const typedNext = c.get<typeof nextPaths>(nextPaths);
console.log(typedNext.weight, typedNext.height);
```
