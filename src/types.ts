import type { Player as PlayerType } from "./actors/Player.ts";

export type Player = PlayerType;

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

export type ItemType =
  | "consumable"
  | "weapon"
  | "armor"
  | "accessory"
  | "quest"
  | "material"
  | "book";

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
  weapon: Item | null;
  armor: Item | null;
  accessory: Item | null;
}

export interface Actor {
  name: string;
  hp: number;
  attack: number;
  defense: number;
  luck?: number;
  type?: string;
}

export interface Enemy extends Actor {
  exp: number;
  loot?: string[];
  gold: () => number;
}

export interface QuestObjective {
  type: string;
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
  type: string;
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
