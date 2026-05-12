import { OBJECT_TYPE } from "../constants.ts";
import { game } from "../gameState.ts";
import type { GameObject, Item, LeveledItem } from "../types.ts";
import { ITEMS } from "../world/items.ts";

const MAX_LEVELED_ITEM_DEPTH = 10;

function isLeveledItem(object: GameObject): object is LeveledItem {
  return object.objectType === OBJECT_TYPE.LEVELED_ITEM;
}

function shuffle<T>(items: T[]): T[] {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index--) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

function pickFromLeveledItem(
  leveledItem: LeveledItem,
  level: number,
  visited = new Set<string>(),
  depth = 0,
): Item | null {
  if (depth >= MAX_LEVELED_ITEM_DEPTH || visited.has(leveledItem.id)) {
    return null;
  }

  const nextVisited = new Set(visited);
  nextVisited.add(leveledItem.id);

  const eligibleEntries = leveledItem.list.filter((node) => node.levelRequired <= level);
  if (eligibleEntries.length === 0) return null;

  for (const entry of shuffle(eligibleEntries)) {
    if (isLeveledItem(entry.object)) {
      const nestedItem = pickFromLeveledItem(entry.object, level, nextVisited, depth + 1);
      if (nestedItem) {
        return nestedItem;
      }
      continue;
    }

    const item = ITEMS[entry.object.id];
    if (item) {
      return item;
    }
  }

  return null;
}

function createLeveledItem(id: string, list: LeveledItem["list"]): LeveledItem {
  return {
    id,
    objectType: OBJECT_TYPE.LEVELED_ITEM,
    list,
    pickFrom(): Item | null {
      if (!game.player) {
        return null;
      }

      return pickFromLeveledItem(this, game.player.level);
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

export function generateLoot(leveledItemId: string): string | null {
  const table = LEVELED_ITEMS[leveledItemId];
  if (!table) return null;

  return table.pickFrom()?.id ?? null;
}
