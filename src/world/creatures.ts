import { getCreature } from "../gameState.ts";
import { cloneInventory, createInventory } from "../systems/inventory.ts";
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
  exp: number;
  loot?: string[];
  gold: () => number;
};

export const CREATURES: CreatureEntry[] = [
  {
    type: CREATURE_TYPE.HUMANOID,
    id: "goblin",
    name: "Goblin",
    health: 45,
    strength: 12,
    endurance: 6,
    exp: 35,
    loot: ["rusty_dagger", "goblin_ear"],
    gold: () => Math.floor(Math.random() * 16) + 10,
  },
  {
    type: CREATURE_TYPE.HUMANOID,
    id: "goblin_shaman",
    name: "Goblin Shaman",
    health: 65,
    strength: 18,
    endurance: 7,
    exp: 80,
    loot: ["mana_essence", "bone_charm", "goblin_ear"],
    gold: () => Math.floor(Math.random() * 21) + 30,
  },
  {
    type: CREATURE_TYPE.UNDEAD,
    id: "skeleton",
    name: "Ancient Skeleton",
    health: 60,
    strength: 14,
    endurance: 8,
    loot: ["bone_fragment", "rusty_sword"],
    gold: () => Math.floor(Math.random() * 21) + 20,
    exp: 50,
  },
  {
    type: CREATURE_TYPE.NORMAL,
    id: "stone_golem",
    name: "Stone Golem",
    health: 120,
    strength: 18,
    endurance: 15,
    loot: ["stone_core"],
    gold: () => Math.floor(Math.random() * 31) + 40,
    exp: 100,
  },
  {
    type: CREATURE_TYPE.HUMANOID,
    id: "void_cultist",
    name: "Void Cultist",
    health: 80,
    strength: 20,
    endurance: 10,
    loot: ["void_essence", "dark_tome"],
    gold: () => Math.floor(Math.random() * 26) + 30,
    exp: 80,
  },
  {
    type: CREATURE_TYPE.NORMAL,
    id: "wolf",
    name: "Timber Wolf",
    health: 40,
    strength: 10,
    endurance: 5,
    loot: ["wolf_pelt", "fangs"],
    gold: () => Math.floor(Math.random() * 15) + 10,
    exp: 30,
  },
  {
    type: CREATURE_TYPE.NORMAL,
    id: "forest_spider",
    name: "Forest Spider",
    health: 25,
    strength: 12,
    endurance: 3,
    loot: ["spider_silk", "venom_sac"],
    gold: () => Math.floor(Math.random() * 10) + 5,
    exp: 25,
  },
];

export function createCreature(creature: CreatureEntry): Creature {
  return {
    id: creature.id,
    objectType: OBJECT_TYPE.ACTOR,
    equipment: { weapon: null, armor: null },
    inventory: createInventory(),
    hasItemEquipped: (_id: string) => false,
    offersServices: (_service) => false,
    tradesItemType: (_t) => false,

    type: creature.type,
    name: creature.name ?? creature.id,
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
    exp: creature.exp,
    loot: creature.loot,
    gold: creature.gold,
  };
}

function cloneCreature(creature: Creature): Creature {
  return {
    ...creature,
    equipment: { ...creature.equipment },
    inventory: cloneInventory(creature.inventory),
    health: { ...creature.health },
    magicka: { ...creature.magicka },
    luck: { ...creature.luck },
    strength: { ...creature.strength },
    willpower: { ...creature.willpower },
    agility: { ...creature.agility },
    speed: { ...creature.speed },
    endurance: { ...creature.endurance },
    personality: { ...creature.personality },
    intelligence: { ...creature.intelligence },
    loot: creature.loot ? [...creature.loot] : undefined,
  };
}

export function createCreatureInstance(id: string): Creature {
  const exists = getCreature(id);
  if (exists) {
    return cloneCreature(exists);
  }

  const creature = CREATURES.find((entry) => entry.id === id);

  if (!creature) {
    throw new Error(`Unknown creature id: ${id}`);
  }

  return createCreature(creature);
}
