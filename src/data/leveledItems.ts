import { OBJECT_TYPE } from "../constants.ts";
import { game } from "../core/gameState.ts";
import type { Item, LeveledItem } from "../types.ts";
import { ALCHEMY } from "./alchemy.ts";
import { WEAPONS } from "./weapons.ts";
import { ARMORS } from "./armors.ts";
import { MISC_ITEMS } from "./misc.ts";

const ITEMS = { ...ALCHEMY, ...WEAPONS, ...ARMORS, ...MISC_ITEMS };

const MAX_LEVELED_ITEM_DEPTH = 10;

type LeveledListNodeRegistryEntry = { levelRequired: number; object: string };

type LeveledItemRegistryEntry = {
  id: string;
  chanceForNothing?: number;
  list: LeveledListNodeRegistryEntry[];
};

function isLeveledItem(object: unknown): object is LeveledItem {
  return Boolean(
    object &&
    typeof object === "object" &&
    "objectType" in object &&
    (object as LeveledItem).objectType === OBJECT_TYPE.LEVELED_ITEM,
  );
}

function getLeveledItemRegistryEntry(
  leveledItemId: string,
): LeveledItemRegistryEntry | undefined {
  return LEVELED_ITEMS.find((entry) => entry.id === leveledItemId);
}

function shuffle<T>(items: T[]): T[] {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index--) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [
      shuffled[swapIndex],
      shuffled[index],
    ];
  }
  return shuffled;
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

function pickFromLeveledItemRecursive(
  leveledItem: LeveledItem,
  level: number,
  visited: Set<string>,
  depth: number,
): Item | null {
  if (depth >= MAX_LEVELED_ITEM_DEPTH || visited.has(leveledItem.id))
    return null;

  const nextVisited = new Set(visited);
  nextVisited.add(leveledItem.id);

  const eligible = leveledItem.list.filter(
    (node) => node.levelRequired <= level,
  );
  if (eligible.length === 0) return null;

  for (const entry of shuffle(eligible)) {
    if (entry.object.objectType === OBJECT_TYPE.LEVELED_ITEM) {
      const nested = pickFromLeveledItemRecursive(
        entry.object as LeveledItem,
        level,
        nextVisited,
        depth + 1,
      );
      if (nested) return nested;
      continue;
    }

    const item = ITEMS[entry.object.id];
    if (item) return item;
  }

  return null;
}

function pickFromLeveledItem(
  leveledItem: LeveledItem,
  level: number,
): Item | null {
  return pickFromLeveledItemRecursive(leveledItem, level, new Set<string>(), 0);
}

export function createLeveledItem(
  leveledItemId: string,
): LeveledItem | undefined {
  const existing = game.dataHandler.nonDynamicData.objects.find(
    (object) => object.id === leveledItemId && isLeveledItem(object),
  );
  if (existing && isLeveledItem(existing)) return existing;

  const def = getLeveledItemRegistryEntry(leveledItemId);
  if (!def) return undefined;

  const runtime = {
    id: def.id,
    objectType: OBJECT_TYPE.LEVELED_ITEM,
    chanceForNothing: def.chanceForNothing ?? 0,
    list: [],
    pickFrom(): Item | null {
      if (!game.player) return null;
      if (
        (def.chanceForNothing ?? 0) > 0 &&
        Math.random() < (def.chanceForNothing ?? 0)
      )
        return null;
      return pickFromLeveledItem(runtime, game.player.level);
    },
  } as LeveledItem;

  game.dataHandler.nonDynamicData.objects.push(runtime);

  runtime.list = def.list.reduce<LeveledItem["list"]>((list, entry) => {
    const nestedLeveledItem = createLeveledItem(entry.object);
    if (nestedLeveledItem) {
      list.push({
        levelRequired: entry.levelRequired,
        object: nestedLeveledItem,
      });
      return list;
    }

    const item = ITEMS[entry.object];
    if (!item) return list;

    list.push({ levelRequired: entry.levelRequired, object: item });
    return list;
  }, []);

  return runtime;
}
