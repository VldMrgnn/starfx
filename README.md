![starfx](https://erock.imgs.sh/starfx)

# starfx

Supercharged async flow control library.

> This project is under active development, there are zero guarantees for API
> stability.

## features

- async flow control library for `deno`, `node`, and browser
- side-effect system for `redux`
- data synchronization and caching for `react` and `redux`

## example

```ts
import { run, parallel, request, json } from 'starfx';

function* fetchMovie(title: string) {
  const response = yield* request(`/movies/${title}`);
  const data = yield* json(response);
  return data;
}

const task = run(function*() {
  const movies = ['titanic', 'avatar', 'good will hunting'];
  const ops = movies.map((title) => () => fetchMovie(title));
  const group = yield* parallel(ops);
  const results = yield* group;
  return results;
});

const results = await task;
console.log(results);
```

## usage

Please see [examples repo](https://github.com/neurosnap/starfx-examples).
