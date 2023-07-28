import type { MapEntity, PatchEntity, AnyState } from "../deps.ts";

export const fxCreateTable = <Entity extends AnyState = AnyState>({
  name,
  initialState,
}: {
  name: string;
  initialState: MapEntity<Entity>;
}) => {
  return {
    name,
    initialState: initialState as MapEntity<Entity>,
    actions: {
      add: (value: MapEntity<Entity>) => {
        return { type: `@@starfx/${name}/add`, payload: value };
      },
      set: (value: MapEntity<Entity>) => {
        return { type: `@@starfx/${name}/set`, payload: value };
      },
      remove: (value: string[]) => {
        return { type: `@@starfx/${name}/remove`, payload: value };
      },
      patch: (value: PatchEntity<MapEntity<Entity>>) => {
        return { type: `@@starfx/${name}/patch`, payload: value };
      },
      merge: (value: PatchEntity<MapEntity<Entity>>) => {
        return { type: `@@starfx/${name}/merge`, payload: value };
      },
      reset: () => {
        return { type: `@@starfx/${name}/set`, payload: initialState };
      },
    }
  };
};
