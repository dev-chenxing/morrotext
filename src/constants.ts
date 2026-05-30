const OBJECT_TYPES = {
  ACTION: "action",
  ACTIVATOR: "activator",
  ALCHEMY: "alchemy",
  AMMUNITION: "ammunition",
  APPARATUS: "apparatus",
  ARMOR: "armor",
  BIRTHSIGN: "birthsign",
  BOOK: "book",
  CELL: "cell",
  CLASS: "class",
  CLOTHING: "clothing",
  CONTAINER: "container",
  CREATURE: "creature",
  DIALOGUE: "dialogue",
  DIALOGUE_INFO: "dialogueInfo",
  DOOR: "door",
  ENCHANTMENT: "enchantment",
  FACTION: "faction",
  INGREDIENT: "ingredient",
  LEVELED_CREATURE: "leveledCreature",
  LEVELED_ITEM: "leveledItem",
  LOCKPICK: "lockpick",
  MAGIC_EFFECT: "magicEffect",
  MISC_ITEM: "misc",
  MOBILE_ACTOR: "mobileActor",
  MOBILE_CREATURE: "mobileCreature",
  MOBILE_NPC: "mobileNPC",
  MOBILE_PLAYER: "mobilePlayer",
  NPC: "npc",
  PROBE: "probe",
  QUEST: "quest",
  RACE: "race",
  REFERENCE: "reference",
  REGION: "region",
  REPAIR_ITEM: "repairItem",
  SCRIPT: "script",
  SKILL: "skill",
  SOUND: "sound",
  STARTSCRIPT: "startScript",
  STATIC: "static",
  WEAPON: "weapon",
} as const;

export const OBJECT_TYPE = OBJECT_TYPES;

export type OBJECT_TYPE = (typeof OBJECT_TYPES)[keyof typeof OBJECT_TYPES];

export namespace OBJECT_TYPE {
  export type ACTION = typeof OBJECT_TYPES.ACTION;
  export type ACTIVATOR = typeof OBJECT_TYPES.ACTIVATOR;
  export type ALCHEMY = typeof OBJECT_TYPES.ALCHEMY;
  export type ARMOR = typeof OBJECT_TYPES.ARMOR;
  export type BOOK = typeof OBJECT_TYPES.BOOK;
  export type DIALOGUE = typeof OBJECT_TYPES.DIALOGUE;
  export type DIALOGUE_INFO = typeof OBJECT_TYPES.DIALOGUE_INFO;
  export type CELL = typeof OBJECT_TYPES.CELL;
  export type CLASS = typeof OBJECT_TYPES.CLASS;
  export type CLOTHING = typeof OBJECT_TYPES.CLOTHING;
  export type CONTAINER = typeof OBJECT_TYPES.CONTAINER;
  export type CREATURE = typeof OBJECT_TYPES.CREATURE;
  export type DOOR = typeof OBJECT_TYPES.DOOR;
  export type ENCHANTMENT = typeof OBJECT_TYPES.ENCHANTMENT;
  export type FACTION = typeof OBJECT_TYPES.FACTION;
  export type INGREDIENT = typeof OBJECT_TYPES.INGREDIENT;
  export type LEVELED_CREATURE = typeof OBJECT_TYPES.LEVELED_CREATURE;
  export type LEVELED_ITEM = typeof OBJECT_TYPES.LEVELED_ITEM;
  export type MISC_ITEM = typeof OBJECT_TYPES.MISC_ITEM;
  export type NPC = typeof OBJECT_TYPES.NPC;
  export type QUEST = typeof OBJECT_TYPES.QUEST;
  export type WEAPON = typeof OBJECT_TYPES.WEAPON;
}

const DIALOGUE_TYPES = {
  GREETING: "greeting",
  JOURNAL: "journal",
  SERVICE: "service",
  TOPIC: "topic",
} as const;

export const DIALOGUE_TYPE = DIALOGUE_TYPES;

export type DIALOGUE_TYPE = (typeof DIALOGUE_TYPES)[keyof typeof DIALOGUE_TYPES];

export namespace DIALOGUE_TYPE {
  export type GREETING = typeof DIALOGUE_TYPES.GREETING;
  export type JOURNAL = typeof DIALOGUE_TYPES.JOURNAL;
  export type SERVICE = typeof DIALOGUE_TYPES.SERVICE;
  export type TOPIC = typeof DIALOGUE_TYPES.TOPIC;
}

const MERCHANT_SERVICE_VALUES = { TRAINING: "training", REPAIR: "repair" } as const;

export const MERCHANT_SERVICE = MERCHANT_SERVICE_VALUES;

export type MERCHANT_SERVICE =
  (typeof MERCHANT_SERVICE_VALUES)[keyof typeof MERCHANT_SERVICE_VALUES];

export namespace MERCHANT_SERVICE {
  export type TRAINING = typeof MERCHANT_SERVICE_VALUES.TRAINING;
  export type REPAIR = typeof MERCHANT_SERVICE_VALUES.REPAIR;
}

const SLOT_VALUES = { WEAPON: "weapon", ARMOR: "armor" } as const;

export const SLOT = SLOT_VALUES;

export type SLOT = (typeof SLOT_VALUES)[keyof typeof SLOT_VALUES];

export namespace SLOT {
  export type WEAPON = typeof SLOT_VALUES.WEAPON;
  export type ARMOR = typeof SLOT_VALUES.ARMOR;
}

const CREATURE_TYPE_VALUES = {
  NORMAL: "normal",
  DAEDRA: "daedra",
  UNDEAD: "undead",
  HUMANOID: "humanoid",
} as const;

export const CREATURE_TYPE = CREATURE_TYPE_VALUES;

export type CREATURE_TYPE = (typeof CREATURE_TYPE_VALUES)[keyof typeof CREATURE_TYPE_VALUES];

export namespace CREATURE_TYPE {
  export type NORMAL = typeof CREATURE_TYPE_VALUES.NORMAL;
  export type DAEDRA = typeof CREATURE_TYPE_VALUES.DAEDRA;
  export type UNDEAD = typeof CREATURE_TYPE_VALUES.UNDEAD;
  export type HUMANOID = typeof CREATURE_TYPE_VALUES.HUMANOID;
}

const ACTOR_TYPE_VALUES = { PLAYER: "player", NPC: "npc", CREATURE: "creature" } as const;

export const ACTOR_TYPE = ACTOR_TYPE_VALUES;

export type ACTOR_TYPE = (typeof ACTOR_TYPE_VALUES)[keyof typeof ACTOR_TYPE_VALUES];

export namespace ACTOR_TYPE {
  export type PLAYER = typeof ACTOR_TYPE_VALUES.PLAYER;
  export type NPC = typeof ACTOR_TYPE_VALUES.NPC;
  export type CREATURE = typeof ACTOR_TYPE_VALUES.CREATURE;
}

export const GOLD_ID = "Gold_001";

export const SHOP_PRICES = { BUY_MULTIPLIER: 1.2, SELL_MULTIPLIER: 0.6 } as const;

export const COMBAT_BALANCE = {
  ATTACK_VARIANCE_MIN: 0.9,
  ATTACK_VARIANCE_RANGE: 0.2,
  DEFENSE_VARIANCE_MIN: 0.8,
  DEFENSE_VARIANCE_RANGE: 0.4,
  CRIT_BASE_CHANCE: 0.05,
  LUCK_CRIT_DIVISOR: 100,
  MIN_DAMAGE: 1,
} as const;

export const ATTRIBUTES = {
  STRENGTH: "strength",
  INTELLIGENCE: "intelligence",
  WILLPOWER: "willpower",
  AGILITY: "agility",
  SPEED: "speed",
  ENDURANCE: "endurance",
  PERSONALITY: "personality",
  LUCK: "luck",
} as const;

export type ATTRIBUTES = (typeof ATTRIBUTES)[keyof typeof ATTRIBUTES];

export namespace ATTRIBUTES {
  export type STRENGTH = typeof ATTRIBUTES.STRENGTH;
  export type INTELLIGENCE = typeof ATTRIBUTES.INTELLIGENCE;
  export type WILLPOWER = typeof ATTRIBUTES.WILLPOWER;
  export type AGILITY = typeof ATTRIBUTES.AGILITY;
  export type SPEED = typeof ATTRIBUTES.SPEED;
  export type ENDURANCE = typeof ATTRIBUTES.ENDURANCE;
  export type PERSONALITY = typeof ATTRIBUTES.PERSONALITY;
  export type LUCK = typeof ATTRIBUTES.LUCK;
}

export const SPECIALIZATION = { COMBAT: "combat", MAGIC: "magic", STEALTH: "stealth" } as const;

export type SPECIALIZATION = (typeof SPECIALIZATION)[keyof typeof SPECIALIZATION];

export namespace SPECIALIZATION {
  export type COMBAT = typeof SPECIALIZATION.COMBAT;
  export type MAGIC = typeof SPECIALIZATION.MAGIC;
  export type STEALTH = typeof SPECIALIZATION.STEALTH;
}

export const SKILL = {
  BLOCK: 0,
  ARMORER: 1,
  MEDIUM_ARMOR: 2,
  HEAVY_ARMOR: 3,
  BLUNT_WEAPON: 4,
  LONG_BLADE: 5,
  AXE: 6,
  SPEAR: 7,
  ATHLETICS: 8,
  ENCHANT: 9,
  DESTRUCTION: 10,
  ALTERATION: 11,
  ILLUSION: 12,
  CONJURATION: 13,
  MYSTICISM: 14,
  RESTORATION: 15,
  ALCHEMY: 16,
  UNARMORED: 17,
  SECURITY: 18,
  SNEAK: 19,
  ACROBATICS: 20,
  LIGHT_ARMOR: 21,
  SHORT_BLADE: 22,
  MARKSMAN: 23,
  MERCANTILE: 24,
  SPEECHCRAFT: 25,
  HAND_TO_HAND: 26,
} as const;

export type SKILL = (typeof SKILL)[keyof typeof SKILL];
