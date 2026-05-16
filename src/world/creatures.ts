import { createInventoryFromRecord } from "../systems/inventory.ts";
import type { Creature, ValueOf } from "../types.ts";
import { CREATURE_TYPE, OBJECT_TYPE } from "../constants.ts";

export type CreatureEntry = {
  type: ValueOf<typeof CREATURE_TYPE>;
  id: string;
  name?: string;
  health: number;
  magicka?: number;
  luck?: number;
  strength?: number;
  intelligence?: number;
  willpower?: number;
  agility?: number;
  speed?: number;
  endurance?: number;
  personality?: number;
  inventory?: Record<string, number>;
};

export const CREATURES: CreatureEntry[] = [
  {
    type: CREATURE_TYPE.HUMANOID,
    id: "goblin",
    name: "Goblin",
    health: 45,
    strength: 12,
    endurance: 6,
    inventory: {
      rusty_dagger: 1,
      goblin_ear: 1,
      random_gold: 10,
    },
  },
  {
    type: CREATURE_TYPE.HUMANOID,
    id: "goblin_shaman",
    name: "Goblin Shaman",
    health: 65,
    strength: 18,
    endurance: 7,
    inventory: {
      mana_essence: 1,
      bone_charm: 1,
      goblin_ear: 1,
      random_gold: 20,
    },
  },
  {
    type: CREATURE_TYPE.UNDEAD,
    id: "skeleton",
    name: "Ancient Skeleton",
    health: 60,
    strength: 14,
    endurance: 8,
    inventory: {
      bone_fragment: 1,
      rusty_sword: 1,
      random_gold: 20,
    },
  },
  {
    type: CREATURE_TYPE.NORMAL,
    id: "stone_golem",
    name: "Stone Golem",
    health: 120,
    strength: 18,
    endurance: 15,
    inventory: {
      stone_core: 1,
      random_gold: 30,
    },
  },
  {
    type: CREATURE_TYPE.HUMANOID,
    id: "void_cultist",
    name: "Void Cultist",
    health: 80,
    strength: 20,
    endurance: 10,
    inventory: {
      void_essence: 1,
      dark_tome: 1,
      random_gold: 20,
    },
  },
  {
    type: CREATURE_TYPE.NORMAL,
    id: "wolf",
    name: "Timber Wolf",
    health: 40,
    strength: 10,
    endurance: 5,
    inventory: {
      wolf_pelt: 1,
      fangs: 1,
      random_gold: 10,
    },
  },
  {
    type: CREATURE_TYPE.NORMAL,
    id: "forest_spider",
    name: "Forest Spider",
    health: 25,
    strength: 12,
    endurance: 3,
    inventory: {
      spider_silk: 1,
      venom_sac: 1,
      random_gold: 10,
    },
  },
];

export function createCreature(creature: CreatureEntry): Creature {
  return {
    id: creature.id,
    objectType: OBJECT_TYPE.ACTOR,
    barterGold: 0,
    equipment: { weapon: null, armor: null },
    inventory: createInventoryFromRecord(creature.inventory ?? {}),
    hasItemEquipped: (_id: string) => false,
    offersServices: (_service) => false,
    tradesItemType: (_t) => false,

    type: creature.type,
    name: creature.name ?? creature.id,
    description: creature.name ?? "",
    fight: 0,
    health: { base: creature.health, current: creature.health },
    magicka: { base: creature.magicka ?? 0, current: creature.magicka ?? 0 },
    luck: { base: creature.luck ?? 0, current: creature.luck ?? 0 },
    strength: { base: creature.strength ?? 0, current: creature.strength ?? 0 },
    endurance: { base: creature.endurance ?? 0, current: creature.endurance ?? 0 },
    intelligence: {
      base: creature.intelligence ?? 0,
      current: creature.intelligence ?? 0,
    },
    willpower: { base: creature.willpower ?? 0, current: creature.willpower ?? 0 },
    agility: { base: creature.agility ?? 0, current: creature.agility ?? 0 },
    speed: { base: creature.speed ?? 0, current: creature.speed ?? 0 },
    personality: {
      base: creature.personality ?? 0,
      current: creature.personality ?? 0,
    },
  };
}

export function createCreatureInstance(id: string): Creature {
  const creature = CREATURES.find((entry) => entry.id === id);

  if (!creature) {
    throw new Error(`Unknown creature id: ${id}`);
  }

  return createCreature(creature);
}
