import { ALCHEMY } from "./alchemy.ts";
import { WEAPONS } from "./weapons.ts";
import { ARMORS } from "./armors.ts";
import { MISC_ITEMS } from "./misc.ts";

const ITEMS = { ...ALCHEMY, ...WEAPONS, ...ARMORS, ...MISC_ITEMS };

export type LeveledListNodeRegistryEntry = { levelRequired: number; object: string };

export type LeveledItemRegistryEntry = {
  id: string;
  chanceForNothing?: number;
  list: LeveledListNodeRegistryEntry[];
};

export function getLeveledItemRegistryEntry(
  leveledItemId: string,
): LeveledItemRegistryEntry | undefined {
  return LEVELED_ITEMS.find((entry) => entry.id === leveledItemId);
}

export const LEVELED_ITEMS: LeveledItemRegistryEntry[] = [
  {
    id: "random_gold",
    chanceForNothing: 0.4,
    list: [{ levelRequired: 1, object: ITEMS.gold.id }],
  },
  {
    id: "l_forest",
    chanceForNothing: 0,
    list: [
      { levelRequired: 1, object: ITEMS.herbs.id },
      { levelRequired: 1, object: ITEMS.health_potion.id },
      { levelRequired: 5, object: ITEMS.seraphim_staff.id },
    ],
  },
  {
    id: "l_ruins",
    chanceForNothing: 0,
    list: [
      { levelRequired: 1, object: ITEMS.holy_water.id },
      { levelRequired: 2, object: ITEMS.mana_potion.id },
      { levelRequired: 4, object: ITEMS.chainmail.id },
      { levelRequired: 5, object: ITEMS.steel_armor.id },
      { levelRequired: 5, object: ITEMS.dragon_slayer.id },
      { levelRequired: 5, object: ITEMS.divine_armor.id },
    ],
  },
];
