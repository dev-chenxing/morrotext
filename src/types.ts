import type { Player as PlayerType } from "./actors/Player.ts";
import {
  CREATURE_TYPE,
  MERCHANT_SERVICE,
  OBJECT_TYPE,
  SLOT,
  ATTRIBUTES,
  SKILL,
} from "./constants.ts";

export type Player = PlayerType;

export type ValueOf<T> = T[keyof T];

export type GameObject = {
  id: string;
  objectType: ValueOf<typeof OBJECT_TYPE>;
};

export type LeveledListNode = {
  levelRequired: number;
  object: GameObject;
};

export interface LeveledItem extends GameObject {
  chanceForNothing: number; // The percent chance, from 0 to 100, for no object to be chosen.
  list: LeveledListNode[];
  objectType: OBJECT_TYPE.LEVELED_ITEM;
  pickFrom: () => Item | null;
}

export interface Actor extends GameObject {
  equipment: Equipment;
  inventory: Inventory;
  objectType: OBJECT_TYPE.ACTOR | OBJECT_TYPE.NPC;
  hasItemEquipped: (item: string) => boolean;
  offersServices: (service: ValueOf<typeof MERCHANT_SERVICE>) => boolean;
  tradesItemType: (objectType: ValueOf<typeof OBJECT_TYPE>) => boolean;
}

export type AiConfig = {
  barters: {
    [objectType in ValueOf<typeof OBJECT_TYPE>]: boolean;
  };
  offers: {
    [service in ValueOf<typeof MERCHANT_SERVICE>]: boolean;
  };
  fight: number;
};

export interface Statistic {
  base: number;
  current: number;
}

export interface NPC extends Actor {
  aiConfig: AiConfig;
  health: Statistic;
  magicka: Statistic;
  luck: Statistic;
  strength: Statistic;
  intelligence: Statistic;
  willpower: Statistic;
  agility: Statistic;
  speed: Statistic;
  endurance: Statistic;
  personality: Statistic;
  skills: number[];
  class: Class;
  level: number;
  name: string;
  objectType: OBJECT_TYPE.NPC;
  actions: Action[];
}

export interface Item extends GameObject {
  // Minimal base Item: includes `id` and `objectType` from GameObject
  name: string;
  description?: string;
}

export interface Alchemy extends Item {
  value: number;
  effect: any;
}

export interface Weapon extends Item {
  value: number;
  min: number;
  max: number;
}

export interface Armor extends Item {
  value: number;
  armorRating: number;
}

export interface ItemStack {
  count: number;
  object: Item;
}

export interface Inventory {
  items: ItemStack[];
  addItem: (item: Item | string, count?: number) => number;
  removeItem: (item: Item | string, count?: number) => number;
  contains: (item: Item | string) => boolean;
  restock: () => void;
  getItemCount: (item: Item | string) => number;
  resolveLeveledItems: (items: Record<string, number>) => void;
}

export interface Equipment {
  [SLOT.WEAPON]: Weapon | null;
  [SLOT.ARMOR]: Armor | null;
}

export interface Creature extends Actor {
  type: ValueOf<typeof CREATURE_TYPE>;
  name: string;
  health: Statistic;
  magicka: Statistic;
  luck: Statistic;
  strength: Statistic;
  intelligence: Statistic;
  willpower: Statistic;
  agility: Statistic;
  speed: Statistic;
  endurance: Statistic;
  personality: Statistic;
}

export interface QuestObjective {
  type: QuestObjectiveType;
  description: string;
  item?: string;
  count?: number;
  target?: string;
  npc?: string;
}

export interface QuestReward {
  gold: number;
  items?: string[];
}

export interface Quest {
  title: string;
  objectives: QuestObjective[];
  reward: QuestReward;
}

export interface ActiveQuest extends Quest {
  key: string;
  progress: number;
  completed?: boolean;
}

export type StoryFlags = Record<string, boolean>;

export interface Action {
  id: string;
  name: string;
  description: string;
  execute: (player: Player, target?: any) => number | void;
  condition?: (player: Player, target?: any) => boolean;
  // optional legacy fields for data-driven actions
  manaCost?: number;
  damageMultiplier?: number;
  healMultiplier?: number;
}

export interface Class extends GameObject {
  name: string;
  // Two attribute IDs associated with the class (maps to `ATTRIBUTES`).
  attributes: ValueOf<typeof ATTRIBUTES>[];
  // Major and minor skills for the class (maps to `SKILL`).
  majorSkills: ValueOf<typeof SKILL>[];
  minorSkills: ValueOf<typeof SKILL>[];
  startingItems: string[];
  actions: Action[];
  barters: {
    [objectType in ValueOf<typeof OBJECT_TYPE>]: boolean;
  };
  offers: {
    [service in ValueOf<typeof MERCHANT_SERVICE>]: boolean;
  };
  description: string;
  playable: boolean;
}

export type DynamicValue<T> = T | ((player: Player) => T);

export interface Area {
  id: string;
  name: string;
  description: DynamicValue<string>;
  npcs: string[];
  quests?: string[];
  lootTable?: string;
  enemies?: DynamicValue<string[]>;
  travelCondition?: (player: Player) => boolean;
}

export interface DialogueOption {
  text: string;
  action: string;
  shop?: string;
  quest?: string;
  cost?: number;
  condition?: (player: Player) => boolean;
}

export interface DialogueState {
  question: DynamicValue<string>;
  options: DialogueOption[];
}

export interface Dialogue {
  id: string;
  name: string;
  dialogues: Record<string, DialogueState>;
}

export interface DialogueActionResult {
  message?: string;
  exit?: boolean;
  nextState?: string;
  effect?: () => void;
}

export type QuestObjectiveType = "collect" | "return" | "loot" | "report";
