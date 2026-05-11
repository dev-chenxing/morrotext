import { LOOT_BALANCE, LOOT_RARITIES } from "../constants.ts";
import { ITEMS } from "../items.ts";
import type { LootRarity, LootTable } from "../types.ts";

const LOOT_TABLES: Record<string, LootTable> = {
  forest: {
    [LOOT_RARITIES.COMMON]: [ITEMS.health_potion.id, ITEMS.herbs.id],
    [LOOT_RARITIES.RARE]: [ITEMS.magic_amulet.id],
    [LOOT_RARITIES.EPIC]: [ITEMS.seraphim_staff.id],
  },
  ruins: {
    [LOOT_RARITIES.COMMON]: [ITEMS.holy_water.id, ITEMS.mana_potion.id],
    [LOOT_RARITIES.RARE]: [ITEMS.chainmail.id, ITEMS.steel_armor.id],
    [LOOT_RARITIES.EPIC]: [ITEMS.dragon_slayer.id, ITEMS.divine_armor.id],
  },
};

export function generateLoot(lootTable: string): string | null {
  const table = LOOT_TABLES[lootTable];
  if (!table) return null;

  const roll = Math.random();
  const rarity: LootRarity =
    roll < LOOT_BALANCE.EPIC_THRESHOLD
      ? LOOT_RARITIES.EPIC
      : roll < LOOT_BALANCE.RARE_THRESHOLD
        ? LOOT_RARITIES.RARE
        : LOOT_RARITIES.COMMON;

  const pool = table[rarity];
  return pool[Math.floor(Math.random() * pool.length)];
}
