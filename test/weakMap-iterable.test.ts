import IdemWeakMapIterable from '../controller/weakMap-iterable.ts'; // Adjust the import path as needed
import { asserts, describe, it } from '../test.ts';

const tests = describe("IdemWeakMapIterable");

it(tests, "IdemWeakMapIterable - set and get operations", () => {
  const map = IdemWeakMapIterable<object, string>();
  const key = {};
  const value = "value";

  map.set(key, value);
  asserts.assertStrictEquals(
    map.get(key),
    value,
    "The value should be set and retrievable",
  );
});

it(tests, "IdemWeakMapIterable - idempotent set operation", () => {
  const map = IdemWeakMapIterable<object, string>();
  const key = {};
  const value = "value";

  map.set(key, value);
  map.set(key, value); // Setting the same value again should be idempotent
  asserts.assertStrictEquals(
    map.get(key),
    value,
    "The value should remain the same after setting it again",
  );
});

it(tests, "IdemWeakMapIterable - delete operation", () => {
  const map = IdemWeakMapIterable<object, string>();
  const key = {};
  const value = "value";

  map.set(key, value);
  asserts.assertStrictEquals(
    map.delete(key),
    true,
    "The key should be deleted successfully",
  );
  asserts.assertStrictEquals(
    map.get(key),
    undefined,
    "The value should be undefined after deletion",
  );
});

it(tests, "IdemWeakMapIterable - idempotent delete operation", () => {
  const map = IdemWeakMapIterable<object, string>();
  const key = {};

  asserts.assertStrictEquals(
    map.delete(key),
    false,
    "Deleting a non-existent key should return false",
  );
});

it(tests, "IdemWeakMapIterable - has operation", () => {
  const map = IdemWeakMapIterable<object, string>();
  const key = {};
  const value = "value";

  map.set(key, value);
  asserts.assertStrictEquals(
    map.has(key),
    true,
    "The map should have the key after setting it",
  );
  map.delete(key);
  asserts.assertStrictEquals(
    map.has(key),
    false,
    "The map should not have the key after deletion",
  );
});

it(
  tests,
  "IdemWeakMapIterable - set method should handle multiple weak references for the same key",
  () => {
    const map = IdemWeakMapIterable<any, string>();
    const key1 = Symbol("1");

    map.set(key1, "A");
    map.set(key1, "B");
    map.set(key1, "C");

    const values = map.values();
    asserts.assertStrictEquals(
      values.length,
      1,
      "There should be only one value for the same key",
    );
    asserts.assertStrictEquals(
      values[0],
      "C",
      "The value should be 'C' after setting the same key again",
    );
  },
);

it(
  tests,
  "IdemWeakMapIterable - ensure everything is in sync after key dereference",
  () => {
    const map = IdemWeakMapIterable<object, string>();
    const key = {};
    const value = "value";

    map.set(key, value);

    asserts.assertStrictEquals(
      map.get(key),
      value,
      "The value should be set and retrievable",
    );

    map.delete(key);

    asserts.assertStrictEquals(
      map.get(key),
      undefined,
      "The value should be undefined after deletion",
    );

    const keys = map.keys();
    const values = map.values();
    asserts.assertStrictEquals(
      keys.length,
      0,
      "The keys array should be empty after deletion",
    );
    asserts.assertStrictEquals(
      values.length,
      0,
      "The values array should be empty after deletion",
    );

    asserts.assertStrictEquals(
      map.has(key),
      false,
      "The WeakMap should not have the key after deletion",
    );
  },
);
