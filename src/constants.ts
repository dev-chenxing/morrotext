export const OBJECT_TYPE = {
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

export type OBJECT_TYPE = (typeof OBJECT_TYPE)[keyof typeof OBJECT_TYPE];

export const MERCHANT_SERVICE = {
  TRAINING: "training",
  REPAIR: "repair",
} as const;

export type MERCHANT_SERVICE =
  (typeof MERCHANT_SERVICE)[keyof typeof MERCHANT_SERVICE];

export const SLOT = {
  WEAPON: "weapon",
  ARMOR: "armor",
  ACCESSORY: "accessory",
} as const;

export type SLOT = (typeof SLOT)[keyof typeof SLOT];

export const CREATURE_TYPE = {
  NORMAL: "normal",
  DAEDRA: "daedra",
  UNDEAD: "undead",
  HUMANOID: "humanoid",
} as const;

export type CREATURE_TYPE = (typeof CREATURE_TYPE)[keyof typeof CREATURE_TYPE];

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
