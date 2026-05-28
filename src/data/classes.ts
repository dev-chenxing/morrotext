import { MERCHANT_SERVICE, OBJECT_TYPE, ATTRIBUTES, SKILL } from "../constants.ts";
import type { ValueOf } from "../types.ts";

export type ClassEntry = {
  id: string;
  name: string;
  // two attribute IDs from ATTRIBUTES
  attributes?: ValueOf<typeof ATTRIBUTES>[];
  // major/minor skill IDs from SKILL
  majorSkills?: ValueOf<typeof SKILL>[];
  minorSkills?: ValueOf<typeof SKILL>[];
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
    description: "A strong and resilient fighter, skilled with weapons and armor.",
    attributes: [ATTRIBUTES.STRENGTH, ATTRIBUTES.ENDURANCE],
    majorSkills: [
      SKILL.LONG_BLADE,
      SKILL.AXE,
      SKILL.HEAVY_ARMOR,
      SKILL.SHORT_BLADE,
      SKILL.MARKSMAN,
    ],
    minorSkills: [
      SKILL.SPEECHCRAFT,
      SKILL.LIGHT_ARMOR,
      SKILL.ALCHEMY,
      SKILL.DESTRUCTION,
      SKILL.RESTORATION,
    ],
    startingItems: ["iron_sword", "leather_armor"],
  },
  {
    id: "mage",
    name: "Mage",
    playable: true,
    attributes: [ATTRIBUTES.INTELLIGENCE, ATTRIBUTES.WILLPOWER],
    majorSkills: [
      SKILL.DESTRUCTION,
      SKILL.ILLUSION,
      SKILL.CONJURATION,
      SKILL.ALTERATION,
      SKILL.RESTORATION,
    ],
    minorSkills: [
      SKILL.ALCHEMY,
      SKILL.MARKSMAN,
      SKILL.SPEECHCRAFT,
      SKILL.LIGHT_ARMOR,
      SKILL.SHORT_BLADE,
    ],
    startingItems: ["oak_staff", "mana_potion", "cloth_robe"],
    actions: ["fireball"],
    description:
      "A master of the arcane arts, wielding powerful spells at the cost of physical strength.",
  },
  {
    id: "cleric",
    name: "Cleric",
    playable: true,
    attributes: [ATTRIBUTES.WILLPOWER, ATTRIBUTES.PERSONALITY],
    majorSkills: [
      SKILL.RESTORATION,
      SKILL.DESTRUCTION,
      SKILL.SPEECHCRAFT,
      SKILL.ALTERATION,
      SKILL.CONJURATION,
    ],
    minorSkills: [
      SKILL.ALCHEMY,
      SKILL.HEAVY_ARMOR,
      SKILL.LONG_BLADE,
      SKILL.LIGHT_ARMOR,
      SKILL.MARKSMAN,
    ],
    startingItems: ["mace", "holy_symbol", "cloth_robe"],
    actions: ["divineHeal"],
    description: "A devoted healer, using divine magic to support allies and smite foes.",
  },
  {
    id: "smith",
    name: "Smith",
    attributes: [ATTRIBUTES.STRENGTH, ATTRIBUTES.ENDURANCE],
    barters: {
      [OBJECT_TYPE.WEAPON]: true,
      [OBJECT_TYPE.ARMOR]: true,
      [OBJECT_TYPE.ACCESSORY]: true,
    },
    description: "A village smith; sells weapons and armor.",
    playable: false,
  },
  {
    id: "publican",
    name: "Publican",
    attributes: [ATTRIBUTES.PERSONALITY, ATTRIBUTES.LUCK],
    barters: { [OBJECT_TYPE.ALCHEMY]: true },
    description: "Publican and purveyor of potions.",
    playable: false,
  },
  {
    id: "prisoner",
    name: "Prisoner",
    attributes: [ATTRIBUTES.SPEED, ATTRIBUTES.PERSONALITY],
    minorSkills: [SKILL.SPEECHCRAFT, SKILL.SHORT_BLADE],
    description: "A weary prisoner learning to read the room before making a move.",
    playable: false,
  },
  {
    id: "thief",
    name: "Thief",
    attributes: [ATTRIBUTES.AGILITY, ATTRIBUTES.SPEED],
    majorSkills: [SKILL.SHORT_BLADE, SKILL.MARKSMAN, SKILL.SPEECHCRAFT],
    minorSkills: [SKILL.LIGHT_ARMOR, SKILL.ALCHEMY],
    description:
      "A quick and slippery opportunist who survives by timing, charm, and a hidden blade.",
    playable: false,
  },
  {
    id: "Guard",
    name: "Guard",
    attributes: [ATTRIBUTES.STRENGTH, ATTRIBUTES.ENDURANCE],
    majorSkills: [SKILL.LONG_BLADE, SKILL.HEAVY_ARMOR, SKILL.SPEECHCRAFT],
    description: "A disciplined soldier of the Empire.",
    playable: false,
  },
  {
    id: "Agent",
    name: "Agent",
    attributes: [ATTRIBUTES.INTELLIGENCE, ATTRIBUTES.PERSONALITY],
    majorSkills: [SKILL.SPEECHCRAFT],
    minorSkills: [SKILL.ALCHEMY],
    description: "A paper-bound servant of the Empire.",
    playable: false,
  },
];
