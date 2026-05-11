import type { Class } from "./types.ts";

export const CLASSES: Record<string, Class> = {
  warrior: {
    displayName: "Warrior",
    stats: {
      attack: 15,
      defense: 10,
      maxHp: 120,
      luck: 3, // Lower crit chance
    },
    startingItems: ["iron_sword", "leather_armor"],
  },
  mage: {
    displayName: "Mage",
    stats: {
      attack: 8,
      defense: 5,
      maxHp: 80,
      magic: 20,
      maxMana: 150,
      luck: 7,
    },
    startingItems: ["oak_staff", "mana_potion", "cloth_robe"],
    abilities: {
      fireball: {
        manaCost: 40,
        damageMultiplier: 2.5,
        description: "Hurl a fiery projectile (40 mana)",
      },
    },
  },
  cleric: {
    displayName: "Cleric",
    stats: {
      attack: 8,
      defense: 12,
      maxHp: 100,
      magic: 15,
      maxMana: 100,
      luck: 5,
    },
    startingItems: ["mace", "holy_symbol", "cloth_robe"],
    abilities: {
      divineHeal: {
        manaCost: 30,
        healMultiplier: 2,
        description: "Heal wounds with divine light (30 mana)",
      },
    },
  },
};
