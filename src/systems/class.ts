import { OBJECT_TYPE, MERCHANT_SERVICE } from "../constants.ts";
import { getClass } from "../gameState.ts";
import type { Action, Class, ValueOf } from "../types.ts";
import type { ClassEntry } from "../world/classes.ts";

export function createClass(entry: ClassEntry, actionRegistry: Action[] = []): Class {
  const Barters: Record<ValueOf<typeof OBJECT_TYPE>, boolean> = Object.values(OBJECT_TYPE).reduce(
    (acc, key) => {
      acc[key as ValueOf<typeof OBJECT_TYPE>] =
        entry.barters?.[key as ValueOf<typeof OBJECT_TYPE>] ?? false;
      return acc;
    },
    {} as Record<ValueOf<typeof OBJECT_TYPE>, boolean>,
  );

  const Offers: Record<ValueOf<typeof MERCHANT_SERVICE>, boolean> = Object.values(
    MERCHANT_SERVICE,
  ).reduce(
    (acc, key) => {
      acc[key as ValueOf<typeof MERCHANT_SERVICE>] =
        entry.offers?.[key as ValueOf<typeof MERCHANT_SERVICE>] ?? false;
      return acc;
    },
    {} as Record<ValueOf<typeof MERCHANT_SERVICE>, boolean>,
  );

  return {
    id: entry.id,
    objectType: OBJECT_TYPE.ACTOR,
    name: entry.name,
    stats: {
      maxHp: entry.stats?.maxHp ?? 10,
      hp: entry.stats?.maxHp ?? 10,
      maxMana: entry.stats?.maxMana ?? 0,
      mana: entry.stats?.maxMana ?? 0,
      attack: entry.stats?.attack ?? 0,
      defense: entry.stats?.defense ?? 0,
      magic: entry.stats?.magic ?? 0,
      luck: entry.stats?.luck ?? 0,
    },
    startingItems: entry.startingItems ?? [],
    actions: (entry.actions ?? [])
      .map((actionId) => actionRegistry.find((action) => action.id === actionId))
      .filter((action): action is Action => Boolean(action)),
    barters: Barters,
    offers: Offers,
    description: entry.description,
    playable: entry.playable,
  };
}

export default { createClass, getClass };
