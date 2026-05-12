import { OBJECT_TYPE } from "../constants.ts";
import { ITEMS } from "../items.ts";
import type { Item, LeveledItem } from "../types.ts";

function createLeveledItem(id: string, list: LeveledItem["list"]): LeveledItem {
  return {
    id,
    objectType: OBJECT_TYPE.LEVELED_ITEM,
    list,
    pickFrom(level: number): Item | null {
      const eligibleEntries = this.list.filter(
        (node) => node.levelRequired <= level,
      );
      if (eligibleEntries.length === 0) return null;

      const selection =
        eligibleEntries[Math.floor(Math.random() * eligibleEntries.length)];
      return ITEMS[selection.object.id] ?? null;
    },
  };
}

const LEVELED_ITEMS: Record<string, LeveledItem> = {
  forest: createLeveledItem("l_forest", [
    { levelRequired: 1, object: ITEMS.herbs },
    { levelRequired: 1, object: ITEMS.health_potion },
    { levelRequired: 4, object: ITEMS.magic_amulet },
    { levelRequired: 5, object: ITEMS.seraphim_staff },
  ]),
  ruins: createLeveledItem("l_ruins", [
    { levelRequired: 1, object: ITEMS.holy_water },
    { levelRequired: 2, object: ITEMS.mana_potion },
    { levelRequired: 4, object: ITEMS.chainmail },
    { levelRequired: 5, object: ITEMS.steel_armor },
    { levelRequired: 5, object: ITEMS.dragon_slayer },
    { levelRequired: 5, object: ITEMS.divine_armor },
  ]),
};

export function generateLoot(
  leveledItemId: string,
  level: number,
): string | null {
  const table = LEVELED_ITEMS[leveledItemId];
  if (!table) return null;

  return table.pickFrom(level)?.id ?? null;
}
