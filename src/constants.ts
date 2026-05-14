const OBJECT_TYPES = {
  ACCESSORY: "accessory",
  ACTOR: "actor",
  ALCHEMY: "alchemy",
  ARMOR: "armor",
  BOOK: "book",
  ITEM: "item",
  LEVELED_ITEM: "leveled_item",
  MISC: "misc",
  NPC: "npc",
  QUEST: "quest",
  WEAPON: "weapon",
} as const;

export const OBJECT_TYPE = OBJECT_TYPES;

export type OBJECT_TYPE = (typeof OBJECT_TYPES)[keyof typeof OBJECT_TYPES];

export namespace OBJECT_TYPE {
  export type ACCESSORY = typeof OBJECT_TYPES.ACCESSORY;
  export type ACTOR = typeof OBJECT_TYPES.ACTOR;
  export type ALCHEMY = typeof OBJECT_TYPES.ALCHEMY;
  export type ARMOR = typeof OBJECT_TYPES.ARMOR;
  export type BOOK = typeof OBJECT_TYPES.BOOK;
  export type ITEM = typeof OBJECT_TYPES.ITEM;
  export type LEVELED_ITEM = typeof OBJECT_TYPES.LEVELED_ITEM;
  export type MISC = typeof OBJECT_TYPES.MISC;
  export type NPC = typeof OBJECT_TYPES.NPC;
  export type QUEST = typeof OBJECT_TYPES.QUEST;
  export type WEAPON = typeof OBJECT_TYPES.WEAPON;
}

const MERCHANT_SERVICE_VALUES = {
  TRAINING: "training",
  REPAIR: "repair",
} as const;

export const MERCHANT_SERVICE = MERCHANT_SERVICE_VALUES;

export type MERCHANT_SERVICE =
  (typeof MERCHANT_SERVICE_VALUES)[keyof typeof MERCHANT_SERVICE_VALUES];

export namespace MERCHANT_SERVICE {
  export type TRAINING = typeof MERCHANT_SERVICE_VALUES.TRAINING;
  export type REPAIR = typeof MERCHANT_SERVICE_VALUES.REPAIR;
}

const SLOT_VALUES = {
  WEAPON: "weapon",
  ARMOR: "armor",
} as const;

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

export const GAME_SETTINGS = {};

export const PLAYER_DEFAULTS = {
  EXP: 0,
  LEVEL: 1,
  GOLD: 50,
  LUCK: 5,
  LEVEL_UP_HP_GAIN: 20,
} as const;

export const GAME_TIMINGS = {
  EFFECT_TICK_INTERVAL_MS: 100,
  BLESSING_DURATION_SECONDS: 60,
} as const;

export const PROGRESSION = {
  MAX_LEVEL_LABEL: "MAX",
} as const;

export const SHOP_PRICES = {
  BUY_MULTIPLIER: 1.2,
  SELL_MULTIPLIER: 0.6,
} as const;

export const COMBAT_BALANCE = {
  ATTACK_VARIANCE_MIN: 0.9,
  ATTACK_VARIANCE_RANGE: 0.2,
  DEFENSE_VARIANCE_MIN: 0.8,
  DEFENSE_VARIANCE_RANGE: 0.4,
  CRIT_BASE_CHANCE: 0.05,
  LUCK_CRIT_DIVISOR: 100,
  MIN_DAMAGE: 1,
  ENEMY_LOOT_DROP_CHANCE: 0.65,
} as const;

export const LOOT_BALANCE = {
  EPIC_THRESHOLD: 0.05,
  RARE_THRESHOLD: 0.3,
} as const;

export const RUINS_BALANCE = {
  RANDOM_ENCOUNTER_THRESHOLD: 0.6,
  CENTRAL_CHAMBER_POTION_THRESHOLD: 0.7,
  HIDDEN_ROOM_LOOT_THRESHOLD: 0.5,
  TRAP_DAMAGE_MIN: 10,
  TRAP_DAMAGE_RANGE: 15,
  ARTIFACT_DESTRUCTION_DAMAGE: 30,
  CLERIC_MANA_BONUS: 20,
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

export const SKILL = {
  HEAVY_ARMOR: 0,
  LONG_BLADE: 1,
  AXE: 2,
  DESTRUCTION: 3,
  ALTERATION: 4,
  ILLUSION: 5,
  CONJURATION: 6,
  RESTORATION: 7,
  ALCHEMY: 8,
  LIGHT_ARMOR: 9,
  SHORT_BLADE: 10,
  MARKSMAN: 11,
  SPEECHCRAFT: 12,
} as const;

export type SKILL = (typeof SKILL)[keyof typeof SKILL];
