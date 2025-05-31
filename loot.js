import { ITEMS } from "./items.js";


const lootTable = {
    common: [
        ITEMS.health_potion.id,
        ITEMS.holy_water.id,
        ITEMS.mana_potion.id
    ],
    rare: [
        ITEMS.chainmail.id,
        ITEMS.steel_armor.id,
        ITEMS.magic_amulet.id,
    ],
    epic: [
        ITEMS.dragon_slayer.id,
        ITEMS.divine_armor.id,
        ITEMS.seraphim_staff.id
    ]
};

export function generateLoot() {
    const roll = Math.random();
    const rarity = roll < 0.05 ? 'epic' :
        roll < 0.3 ? 'rare' : 'common';

    const pool = lootTable[rarity];
    return pool[Math.floor(Math.random() * pool.length)];
}