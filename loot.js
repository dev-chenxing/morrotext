import { ITEMS } from "./items.js";


const lootTable = {
    common: [
        ITEMS.health_potion,
        ITEMS.iron_dagger,
        ITEMS.rusty_sword
    ],
    rare: [
        ITEMS.steel_sword,
        ITEMS.chainmail,
        ITEMS.steel_armor,
        ITEMS.magic_amulet
    ],
    epic: [
        ITEMS.dragon_slayer,
        ITEMS.crown_of_wisdom,
    ]
};

export function generateLoot() {
    const roll = Math.random();
    const rarity = roll < 0.05 ? 'epic' :
        roll < 0.3 ? 'rare' : 'common';

    const pool = lootTable[rarity];
    return pool[Math.floor(Math.random() * pool.length)].name;
}