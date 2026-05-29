import { OBJECT_TYPE } from "../../constants.ts";
import {
  LEVELED_ITEMS,
  type LeveledItemRegistryEntry,
} from "../../data/leveledItems.ts";
import type { Item, LeveledItem } from "../../types.ts";

const MAX_LEVELED_ITEM_DEPTH = 10;

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

// Resolve a leveled-list object id into the runtime object it refers to.
// Nested leveled-list ids become LeveledItem instances; regular ids resolve to items.
function resolveLeveledListObject(id: string): Item | LeveledItem | undefined {
  const anotherLeveledItem = LEVELED_ITEMS.find((entry) => entry.id === id);
  const leveledItem = anotherLeveledItem
    ? createLeveledItem(anotherLeveledItem)
    : undefined;
  if (leveledItem) return leveledItem;

  return mt.getObject(id) as Item | undefined;
}

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

    return entry.object as Item;
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
  definition: LeveledItemRegistryEntry,
): LeveledItem | undefined {
  const existing = mt.getObject(definition.id) as LeveledItem | undefined;
  if (existing) return existing;

  const runtime: LeveledItem = {
    id: definition.id,
    objectType: OBJECT_TYPE.LEVELED_ITEM,
    chanceForNothing: definition.chanceForNothing ?? 0,
    list: [],
    pickFrom(): Item | null {
      const level = mt.mobilePlayer?.object.level ?? 1;
      if (
        runtime.chanceForNothing > 0 &&
        Math.random() < runtime.chanceForNothing
      ) {
        return null;
      }
      return pickFromLeveledItem(runtime, level);
    },
  };

  mt.dataHandler.nonDynamicData.objects.push(runtime);

  runtime.list = definition.list.reduce<LeveledItem["list"]>((list, entry) => {
    const resolved = resolveLeveledListObject(entry.object);
    if (!resolved) return list;

    list.push({ levelRequired: entry.levelRequired, object: resolved });
    return list;
  }, []);

  return runtime;
}

export function createLeveledItems(): void {
  LEVELED_ITEMS.forEach((entry) => {
    createLeveledItem(entry);
  });
}
