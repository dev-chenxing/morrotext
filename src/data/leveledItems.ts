import { ALCHEMY } from "./alchemy.ts";
import { WEAPONS } from "./weapons.ts";
import { ARMORS } from "./armors.ts";
import { MISC_ITEMS } from "./misc.ts";

export type LeveledListNodeRegistryEntry = { levelRequired: number; object: string };

export type LeveledItemRegistryEntry = {
  id: string;
  chanceForNothing?: number;
  list: LeveledListNodeRegistryEntry[];
};

export const LEVELED_ITEMS: LeveledItemRegistryEntry[] = [
  {
    id: "random_gold",
    chanceForNothing: 0.4,
    list: [{ levelRequired: 1, object: MISC_ITEMS.gold.id }],
  },
  {
    id: "l_forest",
    chanceForNothing: 0,
    list: [
      { levelRequired: 1, object: ALCHEMY.herbs.id },
      { levelRequired: 1, object: ALCHEMY.health_potion.id },
      { levelRequired: 5, object: WEAPONS.seraphim_staff.id },
    ],
  },
  {
    id: "l_ruins",
    chanceForNothing: 0,
    list: [
      { levelRequired: 1, object: ALCHEMY.holy_water.id },
      { levelRequired: 2, object: ALCHEMY.mana_potion.id },
      { levelRequired: 4, object: ARMORS.chainmail.id },
      { levelRequired: 5, object: ARMORS.steel_armor.id },
      { levelRequired: 5, object: WEAPONS.dragon_slayer.id },
      { levelRequired: 5, object: ARMORS.divine_armor.id },
    ],
  },
];
