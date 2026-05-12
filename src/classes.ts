import { MERCHANT_SERVICE, OBJECT_TYPE } from "./constants.ts";
import type { Stats, ValueOf } from "./types.ts";

export type ClassEntry = {
  id: string;
  name: string;
  stats?: Partial<Stats>;
  startingItems?: string[];
  actions?: string[];
  barters?: {
    [objectType in ValueOf<typeof OBJECT_TYPE>]?: boolean;
  };
  offers?: {
    [service in ValueOf<typeof MERCHANT_SERVICE>]?: boolean;
  };
  description: string;
  playable: boolean;
};

export const CLASSES: ClassEntry[] = [
  {
    id: "warrior",
    name: "Warrior",
    playable: true,
    description:
      "A strong and resilient fighter, skilled with weapons and armor.",
    stats: {
      attack: 15,
      defense: 10,
      maxHp: 120,
      luck: 3, // Lower crit chance
    },
    startingItems: ["iron_sword", "leather_armor"],
  },
  {
    id: "mage",
    name: "Mage",
    playable: true,
    stats: {
      attack: 8,
      defense: 5,
      maxHp: 80,
      magic: 20,
      maxMana: 150,
      luck: 7,
    },
    startingItems: ["oak_staff", "mana_potion", "cloth_robe"],
    actions: ["fireball"],
    description:
      "A master of the arcane arts, wielding powerful spells at the cost of physical strength.",
  },
  {
    id: "cleric",
    name: "Cleric",
    playable: true,
    stats: {
      attack: 8,
      defense: 12,
      maxHp: 100,
      magic: 15,
      maxMana: 100,
      luck: 5,
    },
    startingItems: ["mace", "holy_symbol", "cloth_robe"],
    actions: ["divineHeal"],
    description:
      "A devoted healer, using divine magic to support allies and smite foes.",
  },
  {
    id: "smith",
    name: "Smith",
    stats: { attack: 0, defense: 0, maxHp: 50 },
    barters: {
      [OBJECT_TYPE.WEAPON]: true,
      [OBJECT_TYPE.ARMOR]: true,
    },
    description: "A village blacksmith; sells weapons and armor.",
    playable: false,
  },
  {
    id: "publican",
    name: "Publican",
    stats: { attack: 0, defense: 0, maxHp: 40 },
    barters: {
      [OBJECT_TYPE.ALCHEMY]: true,
    },
    description: "Innkeeper and purveyor of potions.",
    playable: false,
  },
];
