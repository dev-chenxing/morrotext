import { getCreature } from "../gameState.ts";
import type { Creature, ValueOf } from "../types.ts";
import { CREATURE_TYPE, OBJECT_TYPE } from "../constants.ts";

export type CreatureEntry = {
  type: ValueOf<typeof CREATURE_TYPE>;
  id: string;
  name?: string;
  stats: Partial<Record<string, number>>;
  exp: number;
  loot?: string[];
  gold: () => number;
};

export const CREATURES: CreatureEntry[] = [
  {
    type: CREATURE_TYPE.HUMANOID,
    id: "goblin",
    name: "Goblin",
    stats: { hp: 45, attack: 12, defense: 6 },
    exp: 35,
    loot: ["rusty_dagger", "goblin_ear"],
    gold: () => Math.floor(Math.random() * 16) + 10,
  },
  {
    type: CREATURE_TYPE.HUMANOID,
    id: "goblin_shaman",
    name: "Goblin Shaman",
    stats: { hp: 65, attack: 18, defense: 7 },
    exp: 80,
    loot: ["mana_essence", "bone_charm", "goblin_ear"],
    gold: () => Math.floor(Math.random() * 21) + 30,
  },
  {
    type: CREATURE_TYPE.UNDEAD,
    id: "skeleton",
    name: "Ancient Skeleton",
    stats: { hp: 60, attack: 14, defense: 8 },
    loot: ["bone_fragment", "rusty_sword"],
    gold: () => Math.floor(Math.random() * 21) + 20,
    exp: 50,
  },
  {
    type: CREATURE_TYPE.NORMAL,
    id: "stone_golem",
    name: "Stone Golem",
    stats: { hp: 120, attack: 18, defense: 15 },
    loot: ["stone_core"],
    gold: () => Math.floor(Math.random() * 31) + 40,
    exp: 100,
  },
  {
    type: CREATURE_TYPE.HUMANOID,
    id: "void_cultist",
    name: "Void Cultist",
    stats: { hp: 80, attack: 20, defense: 10 },
    loot: ["void_essence", "dark_tome"],
    gold: () => Math.floor(Math.random() * 26) + 30,
    exp: 80,
  },
  {
    type: CREATURE_TYPE.NORMAL,
    id: "wolf",
    name: "Timber Wolf",
    stats: { hp: 40, attack: 10, defense: 5 },
    loot: ["wolf_pelt", "fangs"],
    gold: () => Math.floor(Math.random() * 15) + 10,
    exp: 30,
  },
  {
    type: CREATURE_TYPE.NORMAL,
    id: "forest_spider",
    name: "Forest Spider",
    stats: { hp: 25, attack: 12, defense: 3 },
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
    inventory: {},
    hasItemEquipped: (_id: string) => false,
    offersServices: (_service) => false,
    tradesItemType: (_t) => false,

    type: creature.type,
    name: creature.name ?? creature.id,
    health: {
      base: creature.stats.maxHp ?? creature.stats.hp ?? 10,
      current: creature.stats.hp ?? creature.stats.maxHp ?? 10,
    },
    magicka: {
      base: creature.stats.maxMana ?? 0,
      current: creature.stats.mana ?? 0,
    },
    luck: {
      base: creature.stats.luck ?? 0,
      current: creature.stats.luck ?? 0,
    },
    strength: {
      base: creature.stats.attack ?? 0,
      current: creature.stats.attack ?? 0,
    },
    endurance: {
      base: creature.stats.defense ?? 0,
      current: creature.stats.defense ?? 0,
    },
    intelligence: {
      base: creature.stats.magic ?? 0,
      current: creature.stats.magic ?? 0,
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
    inventory: { ...creature.inventory },
    health: { ...creature.health },
    magicka: { ...creature.magicka },
    luck: { ...creature.luck },
    strength: { ...creature.strength },
    endurance: { ...creature.endurance },
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
