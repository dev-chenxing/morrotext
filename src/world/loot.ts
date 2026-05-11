import { LOOT_BALANCE } from "../constants.ts";
import { ITEMS } from "../items.ts";
import type { LootTable } from "../types.ts";

const LOOT_TABLES: Record<string, LootTable> = {
  forest: {
    common: [ITEMS.health_potion.id, ITEMS.herbs.id],
    rare: [ITEMS.magic_amulet.id],
    epic: [ITEMS.seraphim_staff.id],
  },
  ruins: {
    common: [ITEMS.holy_water.id, ITEMS.mana_potion.id],
    rare: [ITEMS.chainmail.id, ITEMS.steel_armor.id],
    epic: [ITEMS.dragon_slayer.id, ITEMS.divine_armor.id],
  },
};

export function generateLoot(lootTable: string): string | null {
  const table = LOOT_TABLES[lootTable];
  if (!table) return null;

  const roll = Math.random();
  const rarity: keyof LootTable =
    roll < LOOT_BALANCE.EPIC_THRESHOLD
      ? "epic"
      : roll < LOOT_BALANCE.RARE_THRESHOLD
        ? "rare"
        : "common";

  const pool = table[rarity];
  return pool[Math.floor(Math.random() * pool.length)];
}
