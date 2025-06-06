export {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
} from "vitest";

export function isLikeSelector(selector: unknown) {
  return (
    selector !== null &&
    typeof selector === "object" &&
    Reflect.getPrototypeOf(selector) === Object.prototype &&
    Reflect.ownKeys(selector).length > 0
  );
}

export const CIRCULAR_SELECTOR = new Error("Encountered a circular selector");

export function assertLike(
  lhs: Record<any, any>,
  selector: Record<any, any>,
  circular = new Set(),
) {
  if (circular.has(selector)) {
    throw CIRCULAR_SELECTOR;
  }

  circular.add(selector);

  if (lhs === null || typeof lhs !== "object") {
    return lhs;
  }

  const comparable: Record<any, any> = {};
  for (const [key, rhs] of Object.entries(selector)) {
    if (isLikeSelector(rhs)) {
      comparable[key] = assertLike(Reflect.get(lhs, key), rhs, circular);
    } else {
      comparable[key] = Reflect.get(lhs, key);
    }
  }

  return comparable;
}
