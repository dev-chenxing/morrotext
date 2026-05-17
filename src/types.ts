import type { Player as PlayerType } from "./actors/Player.ts";
import {
  ACTOR_TYPE,
  CREATURE_TYPE,
  MERCHANT_SERVICE,
  OBJECT_TYPE,
  SLOT,
  ATTRIBUTES,
  SKILL,
} from "./constants.ts";

export type Player = PlayerType;

export type ValueOf<T> = T[keyof T];

export abstract class GameObject {
  id: string;
  objectType: ValueOf<typeof OBJECT_TYPE>;

  constructor(id: string, objectType: ValueOf<typeof OBJECT_TYPE>) {
    this.id = id;
    this.objectType = objectType;
  }
}

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
  barterGold: number;
  hasItemEquipped: (item: string) => boolean;
  offersServices: (service: ValueOf<typeof MERCHANT_SERVICE>) => boolean;
  tradesItemType: (objectType: ValueOf<typeof OBJECT_TYPE>) => boolean;
  description?: string;
  fight: number;
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

export type JsonPrimitive = boolean | number | string | null;

export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };

export type JsonRecord = Record<string, JsonValue>;

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

export interface Quest extends GameObject {
  id: string;
  objectType: OBJECT_TYPE.QUEST;
  dialogue: Dialogue[];
  isActive?: boolean;
  isStarted?: boolean;
  isFinished?: boolean;
}

export interface Reference extends GameObject {
  data: JsonRecord;
  tempData: Record<string, unknown>;
  object: GameObject;
  cell: Cell | null;
  previousNode?: Reference | null;
  nextNode?: Reference | null;
  isDead?: boolean;
}

export interface ReferenceList {
  cell: Cell;
  head?: Reference | null;
  tail?: Reference | null;
  size: number;
}

export interface MobileActor {
  activeMagicEffectList: unknown[];
  actorType: ValueOf<typeof ACTOR_TYPE>;
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
  inventory: Inventory;
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

export interface Cell {
  activators?: ReferenceList;
  actors?: ReferenceList;
  // In-game display name. For unnamed exterior cells this should be the region name.
  displayName: DynamicValue<string>;
  // Editor-facing name. For exterior cells include coordinates.
  editorName: string;
  id: string;
  // If true, this is an interior cell (no world coordinates).
  isInterior?: boolean;
  // Interior cell name. Only present for interior cells.
  name?: string;
  description: DynamicValue<string>;
  statics?: ReferenceList;
}

export interface DialogueInfo {
  // The actor (speaker) this info is filtered for.
  actor?: Actor;
  // The cell (speaker's current cell) this info is filtered for.
  cell?: Cell;
  // Quick access to whether the related quest is finished. Null for non-journal dialogues.
  isQuestFinished?: boolean | null;
  // Current journal index for quests; null for non-journal dialogues.
  journalIndex?: number | null;
  // The NPC's class this info is filtered for.
  npcClass?: Class;
  // Optional object type filter (if applicable).
  objectType?: ValueOf<typeof OBJECT_TYPE>;
  // Display text for this dialogue choice / info.
  text: string;
  // Optional runner executed when this dialogue info is chosen. Receives the
  // `Reference` the script should operate on.
  runScript?: (reference: Reference) => Promise<void> | void;
}

export interface Dialogue {
  id: string;
  // Collection of individual dialogue entries.
  info: DialogueInfo[];
  // For journal-style dialogues, the currently active entry index.
  journalIndex?: number | null;
  objectType: ValueOf<typeof OBJECT_TYPE>;
}
