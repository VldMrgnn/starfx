import { isObject } from "./util.ts";

const deepSortObject = (obj: unknown): unknown => {
  if (!isObject(obj)) return obj;
  const sortedObj: Record<string, unknown> = {};
  Object.keys(obj as object)
    .sort()
    .forEach((key) => {
      const value = (obj as Record<string, unknown>)[key];
      sortedObj[key] = isObject(value) ? deepSortObject(value) : value;
    });
  return sortedObj;
};

const padStart = (hash: string, len: number): string => {
  return hash.padStart(len, "0");
};

/**
 * A simple hash function based on a tiny algorithm for quick hashing.
 * https://gist.github.com/iperelivskiy/4110988
 * @param {string} s - The input string to hash.
 * @returns {number} - The resulting hash.
 */
const tinySimpleHash = (s: string): number => {
  let h = 9;
  for (let i = 0; i < s.length;) {
    h = Math.imul(h ^ s.charCodeAt(i++), 9 ** 9);
  }
  return h ^ (h >>> 9);
};

/**
 * Creates a unique key based on a name and optional payload.
 * @param {string} name - The base name for the key.
 * @param {unknown} [payload] - Optional payload to be included in the key.
 * @returns {string} - The generated key.
 */
export const createKey = (name: string, payload?: unknown): string => {
  const normalizedPayload = typeof payload !== "undefined"
    ? JSON.stringify(deepSortObject(payload))
    : "";

  const hash = normalizedPayload
    ? padStart(tinySimpleHash(normalizedPayload).toString(16), 8)
    : "";

  return hash ? `${name}|${hash}` : name;
};
