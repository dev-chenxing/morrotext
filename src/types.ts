import type { Player as PlayerType } from "./actors/Player.ts";
import {
  CREATURE_TYPE,
  MERCHANT_SERVICE,
  OBJECT_TYPE,
  SLOT,
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
  list: LeveledListNode[];
  objectType: OBJECT_TYPE.LEVELED_ITEM;
  pickFrom: () => Item | null;
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
    [objectType in ValueOf<typeof OBJECT_TYPE>]: boolean;
  };
  offers: {
    [service in ValueOf<typeof MERCHANT_SERVICE>]: boolean;
  };
  fight: number;
};

export type Stats = {
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  magic: number;
  maxMana: number;
  mana: number;
  luck: number;
};

export interface NPC extends Actor {
  aiConfig: AiConfig;
  stats: Stats;
  class: Class;
  level: number;
  name: string;
  objectType: OBJECT_TYPE.NPC;
  actions: Action[];
}

export interface Item {
  id: string;
  name: string;
  objectType: ValueOf<typeof OBJECT_TYPE>;
  value: number;
  description?: string;
  stats?: Partial<Stats>;
  effect?: ItemEffect;
}

export interface Equipment {
  [SLOT.WEAPON]: Item | null;
  [SLOT.ARMOR]: Item | null;
  [SLOT.ACCESSORY]: Item | null;
}

export interface Creature extends Actor {
  type: ValueOf<typeof CREATURE_TYPE>;
  name: string;
  stats: Stats;
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
  stats?: Partial<Stats>;
  onApply?: (player: Player) => void;
  onExpire?: (player: Player) => void;
}

export interface ActiveEffect extends Effect {
  expiresAt: number;
  timerId?: ReturnType<typeof setTimeout>;
}

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
  stats: Stats;
  startingItems: string[];
  actions?: Record<string, Action>;
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

export interface ItemEffect {
  hp?: number;
  mana?: number;
  damageUndead?: number;
}

export type QuestObjectiveType = "collect" | "return" | "loot" | "report";
