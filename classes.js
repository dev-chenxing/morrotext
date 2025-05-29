export const CLASSES = {
  warrior: {
    displayName: "Warrior",
    stats: {
      attack: 15, defense: 10, hp: 120,
      luck: 3  // Lower crit chance
    },
    startingItems: ["iron_sword", "leather_armor"]
  },
  mage: {
    displayName: "Mage",
    stats: { attack: 8, defense: 5, hp: 80, magic: 20, mana: 150, luck: 7 },
    startingItems: ["oak_staff", "mana_potion"],
    abilities: {
      fireball: {
        manaCost: 40,
        damageMultiplier: 2.5,
        description: "Hurl a fiery projectile (40 mana)"
      }
    }
  },
  cleric: {
    displayName: "Cleric",
    stats: { attack: 8, defense: 12, hp: 100, magic: 15, mana: 100, luck: 5 },
    startingItems: ["mace", "holy_symbol"],
    abilities: {
      divineHeal: { manaCost: 30, healMultiplier: 2, description: "Heal wounds with divine light (30 mana)" }
    }
  }
};

export const EXP_LEVELS = [
  0, // Level 1
  100, // Level 2
  250, // Level 3
  450, // Level 4
  700 // Level 5
];
