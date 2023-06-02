/**
 * Features:
 * - End-user has more granular control over what events to listen to -- if any
 * - Responding to events happens within a while-loop
 * - End-users are free to mutate variables all they want, they just need to ensure things get re-rendered properly
 * - All events like prop, state changes, click/event handlers are all handled the same
 * - `watch` will await for any events coming out of those `Stream`
 *    It also automatically watches for prop changes
 *
 * TODO:
 * - What happens if a lot of events happen at once?
 *    It seems like we need to watch for a queue of changes
 */
import { sleep } from './deps.ts';
import { request, json } from './fx/mod.ts';

function* render(...args: any[]) {}
function* state(...args: any[]) {}
function* emitter(...args: any[]) {}
function* watch(...args: any[]) {}

function* App() {
  const html = (startAt = 0) => ['div',
    ['p', 'A simple counter'],
    [Counter, { startAt }],
    [MovieList],
  ];

  yield* render(html());
  yield* sleep(1000);
  yield* render(html(5));
}

function* Counter(props: { startAt: number }) {
  let counter = yield* state(props.startAt);
  const increment = yield* emitter();
  const decrement = yield* emitter();

  while (true) {
    const event = yield* watch({
      counter,
      increment,
      decrement,
    });

    if (event.props && event.props.startAt) {
      counter = props.startAt;
    }

    if (event.increment) {
      counter += 1;
    }

    if (event.decrement) {
      counter -= 1;
    }

    yield* render(['div',
      ['div', { style: { display: 'flex' } }, [
        ['div', 'Counter:'],
        ['button', { onClick: increment }, 'decrement'],
        ['div', counter],
        ['button', { onClick: decrement }, 'increment']
      ]]
    ]);
  }
}

function* MovieList() {
  yield* render(['div', 'Loading ...']);

  const resp = yield* request('/movies');
  const movies = yield* json(resp);

  const style = { display: 'flex', flexDirection: 'column', gap: 5 };
  yield* render(['div', { style },
    movies.map((movie) => [Movie, { movie }]),
  ]);
}

function* Movie(props: { title: string; desc: string; img: string }) {
  while (true) {
    yield* watch();

    yield* render(['div', { style: { display: 'flex', gap: 5 } },
      ['div',
        ['img', { src: props.img }],
      ],
      ['div',
        ['h1', props.title],
        ['p', props.desc],
      ],
    ]);
  }
}
