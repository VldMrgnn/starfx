export const ensureArray = <T>(x: T | T[]): T[] =>
  Array.isArray(x) ? x : [x].filter((el) => el !== undefined);
