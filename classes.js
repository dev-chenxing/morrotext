export const CLASSES = {
    warrior: {
        displayName: "Warrior",
        stats: { attack: 15, defense: 10, hp: 120 },
        startingItems: ['iron_sword', 'leather_armor']
    },
    mage: {
        displayName: "Mage",
        stats: { attack: 20, defense: 5, hp: 80, mana: 150 },
        startingItems: ['oak_staff', 'mana_potion']
    },
    cleric: {
        displayName: "Cleric",
        stats: { attack: 8, defense: 12, hp: 100, mana: 100 },
        startingItems: ['mace', 'holy_symbol'],
        abilities: {
            divineHeal: { manaCost: 30, healMultiplier: 2 }
        }
    }
};