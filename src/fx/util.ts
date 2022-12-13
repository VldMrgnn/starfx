import { isString, isStringableFunc, isFunc, isSymbol } from "../predicates.js";

export function makeEffect(type: string, payload: any) {
  return {
    "@@fx/io": true,
    combinator: false,
    type,
    payload,
  };
}

// TODO: fix return type
export function matcher(pattern: any): any {
  const array = (patterns: string[]) => (input: any) =>
    patterns.some((p) => matcher(p)(input));
  const predicate = (predicate: (input: any) => boolean) => (input: any) =>
    predicate(input);
  const string = (pattern: string) => (input: any) =>
    input.type === String(pattern);
  const symbol = (pattern: string) => (input: any) => input.type === pattern;
  const wildcard = () => (v: any) => !!v;

  const matcherCreator: ((d: any) => (p: any) => boolean) | null =
    pattern === "*"
      ? wildcard
      : isString(pattern)
      ? string
      : Array.isArray(pattern)
      ? array
      : isStringableFunc(pattern)
      ? string
      : isFunc(pattern)
      ? predicate
      : isSymbol(pattern)
      ? symbol
      : null;

  if (matcherCreator === null) {
    throw new Error(`invalid pattern: ${pattern}`);
  }

  return matcherCreator(pattern);
}
