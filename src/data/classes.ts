import { MERCHANT_SERVICE, OBJECT_TYPE, ATTRIBUTES, SKILL, SPECIALIZATION } from "../constants.ts";
import type { ValueOf } from "../types.ts";

export type ClassEntry = {
  id: string;
  name: string;
  // two attribute IDs from ATTRIBUTES
  attributes: ValueOf<typeof ATTRIBUTES>[];
  specialization: ValueOf<typeof SPECIALIZATION>;
  // major/minor skill IDs from SKILL
  majorSkills: ValueOf<typeof SKILL>[];
  minorSkills: ValueOf<typeof SKILL>[];
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
    id: "Mage",
    name: "Mage",
    playable: true,
    attributes: [ATTRIBUTES.INTELLIGENCE, ATTRIBUTES.WILLPOWER],
    majorSkills: [
      SKILL.MYSTICISM,
      SKILL.DESTRUCTION,
      SKILL.ALTERATION,
      SKILL.ILLUSION,
      SKILL.RESTORATION,
    ],
    minorSkills: [
      SKILL.ENCHANT,
      SKILL.ALCHEMY,
      SKILL.UNARMORED,
      SKILL.SHORT_BLADE,
      SKILL.CONJURATION,
    ],
    specialization: SPECIALIZATION.MAGIC,
    description:
      "Most mages claim to study magic for its intellectual rewards, but they also often profit from its practical applications. Varying widely in temperament and motivation, mages share but one thing in common - an avid love of spellcasting.",
  },
  {
    id: "Warrior",
    name: "Warrior",
    attributes: [ATTRIBUTES.STRENGTH, ATTRIBUTES.ENDURANCE],
    specialization: SPECIALIZATION.COMBAT,
    playable: true,
    description:
      "Warriors are the professional men-at-arms, soldiers, mercenaries, and adventurers of the Empire, trained with various weapons and armor styles, conditioned by long marches, and hardened by ambush, skirmish, and battle.",
    majorSkills: [
      SKILL.LONG_BLADE,
      SKILL.MEDIUM_ARMOR,
      SKILL.HEAVY_ARMOR,
      SKILL.ATHLETICS,
      SKILL.BLOCK,
    ],
    minorSkills: [SKILL.ARMORER, SKILL.SPEAR, SKILL.MARKSMAN, SKILL.AXE, SKILL.BLUNT_WEAPON],
  },
  {
    id: "Thief",
    name: "Thief",
    attributes: [ATTRIBUTES.SPEED, ATTRIBUTES.AGILITY],
    specialization: SPECIALIZATION.STEALTH,
    playable: true,
    majorSkills: [
      SKILL.SECURITY,
      SKILL.SNEAK,
      SKILL.ACROBATICS,
      SKILL.LIGHT_ARMOR,
      SKILL.SHORT_BLADE,
    ],
    minorSkills: [
      SKILL.MARKSMAN,
      SKILL.SPEECHCRAFT,
      SKILL.HAND_TO_HAND,
      SKILL.MERCANTILE,
      SKILL.ATHLETICS,
    ],
    description:
      "Thieves are pickpockets and pilferers. Unlike robbers, who kill and loot, thieves typically choose stealth and subterfuge over violence, and often entertain romantic notions of their charm and cleverness in their acquisitive activities.",
  },
  {
    id: "Guard",
    name: "Guard",
    attributes: [ATTRIBUTES.STRENGTH, ATTRIBUTES.ENDURANCE],
    majorSkills: [
      SKILL.LONG_BLADE,
      SKILL.BLUNT_WEAPON,
      SKILL.BLOCK,
      SKILL.HEAVY_ARMOR,
      SKILL.MEDIUM_ARMOR,
    ],
    minorSkills: [
      SKILL.ATHLETICS,
      SKILL.HAND_TO_HAND,
      SKILL.SPEECHCRAFT,
      SKILL.ACROBATICS,
      SKILL.SECURITY,
    ],
    specialization: SPECIALIZATION.COMBAT,
    description: "These people maintain the law in Morrowind, by use of force if necessary. ",
    playable: false,
  },
  {
    id: "Agent",
    name: "Agent",
    attributes: [ATTRIBUTES.PERSONALITY, ATTRIBUTES.AGILITY],
    specialization: SPECIALIZATION.STEALTH,
    majorSkills: [
      SKILL.SPEECHCRAFT,
      SKILL.SNEAK,
      SKILL.ACROBATICS,
      SKILL.LIGHT_ARMOR,
      SKILL.SHORT_BLADE,
    ],
    minorSkills: [
      SKILL.MERCANTILE,
      SKILL.CONJURATION,
      SKILL.BLOCK,
      SKILL.UNARMORED,
      SKILL.ILLUSION,
    ],
    description:
      "Agents are operatives skilled in deception and avoidance, but trained in self-defense and the use of deadly force. Self-reliant and independent, agents devote themselves to personal goals, or to various patrons or causes.",
    playable: true,
  },
];
