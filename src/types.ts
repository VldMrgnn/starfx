/**
 * A map of labels. Each label is a key/value pair, where the key must be a
 * string and the value may be a string, number or boolean.
 */
export type Labels = Record<string, string | number | boolean>;

export type Fn = (...args: any[]) => any;

interface NextPropsPending {
  value: undefined;
  state: "pending";
}

interface NextPropsSuccess<S = any> {
  value: S | Action;
  state: "completed";
}

interface NextPropsCancelled<S = any> {
  value: S;
  state: "cancelled";
}

interface NextPropsRunning<S = any> {
  value: S;
  state: "running";
}

interface NextPropsError<E = any> {
  value: E;
  state: "errored";
}

interface NextPropsAborted<E = any> {
  value: E;
  state: "aborted";
}

export type NextProps<S = any, E = any> =
  | NextPropsPending
  | NextPropsSuccess<S>
  | NextPropsCancelled<S>
  | NextPropsRunning<S>
  | NextPropsError<E>
  | NextPropsAborted<E>;

export interface Next {
  (p: NextProps): void;
}

export interface Callback {
  (param: Action): void;
  "@@fx/match"?: PatternFn;
  cancel?: () => void;
}

export type PatternFn = (s: Action) => boolean;

export type ActionType = string | number | symbol;

interface ReduxAction {
  "@@fx/action"?: false;
  type: ActionType;
  payload?: any;
}

export type Action = ReduxAction;

export interface END {
  type: "@@fx/end";
}

export type SagaGenerator<RT, E extends Effect = Effect<any, any>> = Generator<
  E,
  RT
>;

export interface Effect<T = any, P = any> {
  "@@fx/io": true;
  combinator: boolean;
  type: T;
  payload: P;
}

export type ArrayCombinatorEffectDescriptor<E = any> = E[];
export type ObjectCombinatorEffectDescriptor<E = any> = { [key: string]: E };
export type CombinatorEffectDescriptor<E = any> =
  | ArrayCombinatorEffectDescriptor<E>
  | ObjectCombinatorEffectDescriptor<E>;
export interface StrictCombinatorEffect<T>
  extends Effect<T, CombinatorEffectDescriptor<StrictEffect>> {
  combinator: true;
}
export interface SimpleEffect<T, P = any> extends Effect<T, P> {
  combinator: false;
}
export type StrictEffect<T = any, P = any> =
  | SimpleEffect<T, P>
  | StrictCombinatorEffect<T>;
export type SagaIterator<RT = any> = Iterator<StrictEffect, RT, any>;
export type SagaReturnType<S extends Function> = S extends (
  ...args: any[]
) => SagaIterator<infer RT>
  ? RT
  : S extends (...args: any[]) => Promise<infer RT>
  ? RT
  : S extends (...args: any[]) => infer RT
  ? RT
  : never;

type GuardPredicate<G extends T, T = any> = (arg: T) => arg is G;
type Predicate<T> = (arg: T) => boolean;
type StringableActionCreator<A extends Action = Action> = {
  (...args: any[]): A;
  toString(): string;
};
type SubPattern<T> = Predicate<T> | StringableActionCreator | ActionType;
export type Pattern<T> = SubPattern<T> | SubPattern<T>[];
type ActionSubPattern<Guard extends Action = Action> =
  | GuardPredicate<Guard, Action>
  | StringableActionCreator<Guard>
  | Predicate<Action>
  | ActionType;
export type ActionPattern<Guard extends Action = Action> =
  | ActionSubPattern<Guard>
  | ActionSubPattern<Guard>[];

export interface CombinatorEffect<T, P>
  extends Effect<T, CombinatorEffectDescriptor<P>> {
  combinator: true;
}
