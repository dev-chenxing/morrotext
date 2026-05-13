import { CLASSES } from "../world/classes.ts";
import { OBJECT_TYPE, MERCHANT_SERVICE } from "../constants.ts";
import type { Class as GameClass, ValueOf } from "../types.ts";
import type { ClassEntry } from "../world/classes.ts";

export function createClass(entry: ClassEntry): GameClass {
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
    actions: {},
    barters: Barters,
    offers: Offers,
    description: entry.description,
    playable: entry.playable,
  };
}

export function getClass(classId: string): GameClass | undefined {
  const classEntry = CLASSES.find((entry) => entry.id === classId);
  if (!classEntry) {
    return undefined;
  }
  return createClass(classEntry);
}

export default { createClass, getClass };
