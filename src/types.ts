import {
  ACTOR_TYPE,
  CREATURE_TYPE,
  DIALOGUE_TYPE,
  MERCHANT_SERVICE,
  OBJECT_TYPE,
  SLOT,
  ATTRIBUTES,
  SKILL,
} from "./constants.ts";

export type ValueOf<T> = T[keyof T];

export abstract class GameObject {
  id: string;
  objectType: ValueOf<typeof OBJECT_TYPE>;

  constructor(id: string, objectType: ValueOf<typeof OBJECT_TYPE>) {
    this.id = id;
    this.objectType = objectType;
  }
}

export type LeveledListNode = { levelRequired: number; object: GameObject };

export interface LeveledItem extends GameObject {
  chanceForNothing: number; // The percent chance, from 0 to 100, for no object to be chosen.
  list: LeveledListNode[];
  objectType: OBJECT_TYPE.LEVELED_ITEM;
  pickFrom: () => Item | null;
}

export interface Actor extends GameObject {
  equipment: Equipment;
  inventory: Inventory;
  objectType: OBJECT_TYPE.NPC | OBJECT_TYPE.CREATURE;
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

export interface ItemRegistryEntry {
  id: string;
  name: string;
  description?: string;
}

export interface AlchemyRegistryEntry extends ItemRegistryEntry {
  objectType: OBJECT_TYPE.ALCHEMY;
  value: number;
}

export interface ArmorRegistryEntry extends ItemRegistryEntry {
  objectType: OBJECT_TYPE.ARMOR;
  value: number;
  armorRating: number;
}

export interface MiscRegistryEntry extends ItemRegistryEntry {
  objectType: OBJECT_TYPE.MISC_ITEM;
  value: number;
}

export interface WeaponRegistryEntry extends ItemRegistryEntry {
  objectType: OBJECT_TYPE.WEAPON;
  value: number;
  min: number;
  max: number;
}

export interface Alchemy extends Item {
  value: number;
}

export interface Armor extends Item {
  value: number;
  armorRating: number;
}

export interface Misc extends Item {
  value: number;
}

export interface Weapon extends Item {
  value: number;
  min: number;
  max: number;
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
  mobile?: MobileCreature | MobileNPC | MobilePlayer | null;
  cell: Cell | null;
  previousNode?: Reference | null;
  nextNode?: Reference | null;
  isDead?: boolean;
}

export interface ReferenceList {
  cell: Cell;
  head: Reference | null;
  tail: Reference | null;
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
  barterGold: number;
  description?: string;
  fight: number;
  equip: (itemId: string) => boolean;
  unequip: (itemId?: string, slot?: ValueOf<typeof SLOT>) => boolean | void;
}

export interface CreatureInstance extends Actor {
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

export interface MobileCreature extends MobileActor {
  actorType: ACTOR_TYPE.CREATURE;
  object: CreatureInstance;
}

export interface NPCInstance extends Actor {
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
  hasItemEquipped: (item: string) => boolean;
  offersServices: (service: ValueOf<typeof MERCHANT_SERVICE>) => boolean;
  tradesItemType: (objectType: ValueOf<typeof OBJECT_TYPE>) => boolean;
}

export type MobileNPC = Omit<MobileActor, "actorType"> & {
  actorType: ACTOR_TYPE.NPC;
  object: NPCInstance;
  skills: number[];
};

export interface Action {
  id: string;
  name: string;
  description: string;
  execute: (player: MobilePlayer, target?: any) => number | void;
  condition?: (player: MobilePlayer, target?: any) => boolean;
  // optional legacy fields for data-driven actions
  manaCost?: number;
  damageMultiplier?: number;
  healMultiplier?: number;
}

export type MobilePlayer = Omit<MobileNPC, "actorType"> & {
  actorType: ACTOR_TYPE.PLAYER;
  bounty: number;
  levelUpProgress: number;
  reference: Reference;
  addExperience: (xp: number) => void;
  levelUp: () => void;
};

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

export type DynamicValue<T> = T | ((player: MobilePlayer) => T);

export interface CellRegistryEntry {
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
  activators: string[];
  actors: string[];
  statics: string[];
}

export interface Cell extends Omit<CellRegistryEntry, "activators" | "actors" | "statics"> {
  activators: ReferenceList;
  actors: ReferenceList;
  statics: ReferenceList;
}

export interface DialogueInfo {
  // The actor (speaker) this info is filtered for.
  actor?: Actor;
  // The cell (speaker's current cell) this info is filtered for.
  cell?: Cell;
  // Speaker condition: if provided, the function must return true for this dialogue info to pass the filter.
  condition?: () => boolean;
  // Quick access to whether the related quest is finished. Null for non-journal dialogues.
  isQuestFinished?: boolean | null;
  // A unique identifier for this dialogue info
  id: string;
  // Current journal index for quests; null for non-journal dialogues.
  journalIndex?: number | null;
  // The NPC's class this info is filtered for.
  npcClass?: Class;
  // Optional object type filter (if applicable).
  objectType?: OBJECT_TYPE.DIALOGUE_INFO;
  // Receives the `reference` the script should operate on.
  runScript?: (reference: Reference) => Promise<void> | void;
  // Display text for this dialogue choice / info.
  text: string;
}

export interface Dialogue extends GameObject {
  id: string;
  // Collection of individual dialogue entries.
  info: DialogueInfo[];
  type: ValueOf<typeof DIALOGUE_TYPE>;
  objectType: OBJECT_TYPE.DIALOGUE;
  // For journal-style dialogues, the currently active entry index.
  journalIndex?: number | null;
}

export interface DialogueRecordSet {
  greetings: Record<string, Dialogue>;
  journals?: Record<string, Dialogue>;
  services?: Record<string, Dialogue>;
  topics: Record<string, Dialogue>;
}

export interface NonDynamicData {
  actions: Action[];
  cells: Cell[];
  classes: Class[];
  dialogues: Dialogue[];
  objects: GameObject[];
}

export interface DataHandler {
  nonDynamicData: NonDynamicData;
}

export interface WorldController {
  allMobileActors: MobileActor[];
  mobilePlayer: MobilePlayer | null;
  quests: Quest[];
}

export interface MtApi {
  player: Reference | null;
  mobilePlayer: MobilePlayer | null;
  dataHandler: DataHandler;
  worldController: WorldController;
  addItem: (
    target: Reference | MobileActor | Actor | null,
    itemId: string,
    count?: number,
  ) => number;
  addTopic: (topicId: string) => void;
  findQuest: (journal?: Dialogue | string, name?: string) => Quest | undefined;
  getActions: (target: Reference | MobileActor | Actor) => Action[];
  getCell: (cellId: string) => Cell | undefined;
  getClass: (classId: string) => Class | undefined;
  getDialogueInfo: (dialogue: Dialogue | string, id: string) => DialogueInfo | null;
  getItemCount: (target: Reference | MobileActor | Actor | null, itemId: string) => number;
  getJournalIndex: (id: Dialogue | string) => number | null;
  getObject: (objectId: string) => Item | undefined;
  removeItem: (
    target: Reference | MobileActor | Actor | null,
    itemId: string,
    count?: number,
  ) => number;
  updateJournal: (id: Dialogue | string, index: number, showMessage?: boolean) => boolean;
}

declare global {
  var mt: MtApi;
}
