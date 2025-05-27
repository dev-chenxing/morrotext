export const ITEMS = {

    // Consumable
    health_potion: {
        id: 'health_potion',
        name: 'Health Potion',
        type: 'consumable',
        effect: { hp: 30 },
        value: 20
    },
    holy_water: {
        id: 'holy_water',
        name: 'Holy Water',
        type: 'consumable',
        effect: { purify: true },
        value: 30,
    },
    mana_potion: {
        id: 'mana_potion',
        name: 'Mana Potion',
        type: 'consumable',
        effect: { mana: 30 },
        value: 35,
    },

    // Weapons
    rusty_dagger: {
        id: 'rusty_dagger',
        name: 'Rusty Dagger',
        type: 'weapon',
        stats: { attack: 5 },
        value: 15,
    },
    iron_sword: {
        id: 'iron_sword',
        name: 'Iron Sword',
        type: 'weapon',
        stats: { attack: 6 },
        value: 50,
    },
    steel_sword: {
        id: 'steel_sword',
        name: 'Steel Sword',
        type: 'weapon',
        stats: { attack: 8 },
        value: 75
    },
    mace: {
        id: 'mace',
        name: 'Sacred Mace',
        type: 'weapon',
        stats: { attack: 10 },
        value: 100
    },
    steel_dagger: {
        id: 'steel_dagger',
        name: 'Steel Dagger',
        type: 'weapon',
        stats: { attack: 12 },
        value: 85,
        requiredLevel: 3
    },
    oak_staff: {
        id: 'oak_staff',
        name: 'Oak Staff',
        type: 'weapon',
        stats: { magic: 7 },
        value: 80,
    },
    seraphim_staff: {
        id: 'seraphim_staff',
        name: 'Seraphim Staff',
        type: 'weapon',
        stats: { attack: 12, magic: 8 },
        value: 450,
        rarity: 'epic'
    },
    dragon_slayer: {
        id: 'dragon_slayer',
        name: 'Dragon Slayer',
        type: 'weapon',
        stats: { attack: 15 },
        value: 500
    },


    // Armors
    leather_armor: {
        id: 'leather_armor',
        name: 'Leather Armor',
        type: 'armor',
        stats: { defense: 5 },
        value: 40,
    },
    chainmail: {
        id: 'chainmail',
        name: 'Chainmail',
        type: 'armor',
        stats: { defense: 6 },
        value: 120
    },
    steel_armor: {
        id: 'steel_armor',
        name: 'Steel Armor',
        type: 'armor',
        stats: { defense: 10 },
        value: 200
    },
    divine_armor: {
        id: 'divine_armor',
        name: 'Divine Armor',
        type: 'armor',
        stats: { defense: 15, hp: 50 },
        value: 400
    },

    // Magic Items
    holy_symbol: {
        id: 'holy_symbol',
        name: 'Holy Symbol',
        type: 'accessory',
        stats: { magic: 5, defense: 3 },
        value: 150
    },
    magic_amulet: {
        id: 'magic_amulet',
        name: 'Magic Amulet',
        type: 'accessory',
        stats: { defense: 5, magic: 5 },
        value: 150
    },
    crown_of_wisdom: {
        id: 'crown_of_wisdom',
        name: 'Crown of Wisdom',
        type: 'accessory',
        stats: { defense: 10, magic: 10, hp: 50 },
        value: 500
    },

    // Quest Items
    ancient_relic: {
        id: 'ancient_relic',
        name: 'Ancient Relic',
        type: 'quest',
        value: 0,
    },
    goblin_ear: {
        id: 'goblin_ear',
        name: 'Goblin Ear',
        type: 'quest',
        value: 5,
        description: 'Proof of goblin slaying',
    },

};