import { OBJECT_TYPE } from "../../constants.ts";
import { LEVELED_ITEMS, getLeveledItemRegistryEntry } from "../../data/leveledItems.ts";
import type { Item, LeveledItem } from "../../types.ts";
import { game, getLeveledItem, getObject } from "../gameState.ts";

const MAX_LEVELED_ITEM_DEPTH = 10;

function shuffle<T>(items: T[]): T[] {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index--) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

function resolveLeveledListObject(objectId: string): Item | LeveledItem | undefined {
  const nestedLeveledItem = createLeveledItem(objectId);
  if (nestedLeveledItem) return nestedLeveledItem;

  return getObject(objectId);
}

function pickFromLeveledItemRecursive(
  leveledItem: LeveledItem,
  level: number,
  visited: Set<string>,
  depth: number,
): Item | null {
  if (depth >= MAX_LEVELED_ITEM_DEPTH || visited.has(leveledItem.id)) return null;

  const nextVisited = new Set(visited);
  nextVisited.add(leveledItem.id);

  const eligible = leveledItem.list.filter((node) => node.levelRequired <= level);
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

function pickFromLeveledItem(leveledItem: LeveledItem, level: number): Item | null {
  return pickFromLeveledItemRecursive(leveledItem, level, new Set<string>(), 0);
}

export function createLeveledItem(leveledItemId: string): LeveledItem | undefined {
  const existing = getLeveledItem(leveledItemId);
  if (existing) return existing;

  const definition = getLeveledItemRegistryEntry(leveledItemId);
  if (!definition) return undefined;

  const runtime: LeveledItem = {
    id: definition.id,
    objectType: OBJECT_TYPE.LEVELED_ITEM,
    chanceForNothing: definition.chanceForNothing ?? 0,
    list: [],
    pickFrom(): Item | null {
      const level = game.player?.level ?? 1;
      if (runtime.chanceForNothing > 0 && Math.random() < runtime.chanceForNothing) {
        return null;
      }
      return pickFromLeveledItem(runtime, level);
    },
  };

  game.dataHandler.nonDynamicData.objects.push(runtime);

  runtime.list = definition.list.reduce<LeveledItem["list"]>((list, entry) => {
    const object = resolveLeveledListObject(entry.object);
    if (!object) return list;

    list.push({ levelRequired: entry.levelRequired, object });
    return list;
  }, []);

  return runtime;
}

export function createLeveledItems(): void {
  LEVELED_ITEMS.forEach((entry) => {
    createLeveledItem(entry.id);
  });
}
