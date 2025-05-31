import { ITEMS } from "./items.js";


const LOOT_TABLES = {
    forest: {
        common: [
            ITEMS.health_potion.id,
            ITEMS.herbs.id
        ],
        rare: [
            ITEMS.magic_amulet.id,
        ],
        epic: [
            ITEMS.seraphim_staff.id
        ]
    },
    ruins: {
        common: [
            ITEMS.holy_water.id,
            ITEMS.mana_potion.id
        ],
        rare: [
            ITEMS.chainmail.id,
            ITEMS.steel_armor.id,
        ],
        epic: [
            ITEMS.dragon_slayer.id,
            ITEMS.divine_armor.id
        ]
    }

};

export function generateLoot(lootTable) {
    const table = LOOT_TABLES[lootTable];
    if (!table) return null;

    const roll = Math.random();
    const rarity = roll < 0.05 ? 'epic' :
        roll < 0.3 ? 'rare' : 'common';

    const pool = table[rarity];
    return pool[Math.floor(Math.random() * pool.length)];
}