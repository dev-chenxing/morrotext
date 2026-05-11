import type { Player as PlayerType } from "./actors/Player.ts";
import {
  CREATURE_TYPE,
  MERCHANT_SERVICE,
  OBJECT_TYPE,
  SLOT,
} from "./constants.ts";

export type Player = PlayerType;

type ValueOf<T> = T[keyof T];

export type StatKey =
  | "attack"
  | "defense"
  | "maxHp"
  | "magic"
  | "maxMana"
  | "luck";

export type Stats = Partial<Record<StatKey, number>>;

export interface ItemEffect {
  hp?: number;
  mana?: number;
  damageUndead?: number;
}

export type ItemType = OBJECT_TYPE;
export type ClassId = "warrior" | "mage" | "cleric";
export type CreatureType = CREATURE_TYPE;
export type QuestObjectiveType = "collect" | "return" | "loot" | "report";

export type GameObject = {
  id: string;
  objectType: ValueOf<typeof OBJECT_TYPE>;
};

export type LeveledListNode = {
  levelRequired: number;
  object: GameObject;
};

export interface LeveledItem extends GameObject {
  list: LeveledListNode[];
  objectType: OBJECT_TYPE.LEVELED_ITEM;
  pickFrom: () => Item;
}

export interface Actor extends GameObject {
  equipment: Equipment;
  inventory: Record<string, number>;
  objectType: OBJECT_TYPE.ACTOR | OBJECT_TYPE.NPC;
  hasItemEquipped: (item: string) => boolean;
  offersServices: (service: ValueOf<typeof MERCHANT_SERVICE>) => boolean;
  tradesItemType: (objectType: ValueOf<typeof OBJECT_TYPE>) => boolean;
}

export type AiConfig = {
  barters: {
    [objectType in ValueOf<typeof OBJECT_TYPE>]?: boolean;
  };
  offers: {
    [service in ValueOf<typeof MERCHANT_SERVICE>]?: boolean;
  };
  fight: number;
};

export interface NPC extends Actor {
  aiConfig: AiConfig;
  stats: Stats;
  class: Class;
  level: number;
  name: string;
  objectType: OBJECT_TYPE.NPC;
  actions: Action[];
  dialogues?: Record<string, DialogueState>;
  quests?: string[];
}

export interface Item {
  id: string;
  name: string;
  type: ItemType;
  value: number;
  description?: string;
  stats?: Stats;
  effect?: ItemEffect;
}

export interface Equipment {
  [SLOT.WEAPON]: Item | null;
  [SLOT.ARMOR]: Item | null;
  [SLOT.ACCESSORY]: Item | null;
}

export interface Actor {
  name: string;
  hp: number;
  attack: number;
  defense: number;
  luck?: number;
  type?: CreatureType;
}

export interface Enemy extends Actor {
  exp: number;
  loot?: string[];
  gold: () => number;
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
  exp: number;
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

export interface Effect {
  id: string;
  name: string;
  duration: number;
  stats?: Stats;
  onApply?: (player: Player) => void;
  onExpire?: (player: Player) => void;
}

export interface ActiveEffect extends Effect {
  expiresAt: number;
  timerId?: ReturnType<typeof setTimeout>;
}

export interface Action {
  manaCost: number;
  description: string;
  damageMultiplier?: number;
  healMultiplier?: number;
}

export interface Class {
  displayName: string;
  stats: {
    attack: number;
    defense: number;
    maxHp: number;
    magic?: number;
    maxMana?: number;
    luck?: number;
  };
  startingItems: string[];
  abilities?: Record<string, Action>;
}

export type DynamicValue<T> = T | ((player: Player) => T);

export interface Area {
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
  name: string;
  dialogues: Record<string, DialogueState>;
}

export interface DialogueActionResult {
  message?: string;
  exit?: boolean;
  nextState?: string;
  effect?: () => void;
}

export interface LootTable {
  common: string[];
  rare: string[];
  epic: string[];
}
