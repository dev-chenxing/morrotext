import { OBJECT_TYPE } from "../../constants.ts";
import type { Creature, CreatureInstance } from "../../types.ts";
import { CREATURES, type CreatureEntry } from "../../data/creatures.ts";
import { createInventoryFromRecord } from "./inventory.ts";

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
    intelligence: { base: creature.intelligence ?? 0, current: creature.intelligence ?? 0 },
    willpower: { base: creature.willpower ?? 0, current: creature.willpower ?? 0 },
    agility: { base: creature.agility ?? 0, current: creature.agility ?? 0 },
    speed: { base: creature.speed ?? 0, current: creature.speed ?? 0 },
    personality: { base: creature.personality ?? 0, current: creature.personality ?? 0 },
  };
}

export function createCreatureInstance(id: string): CreatureInstance {
  const creature = CREATURES.find((entry) => entry.id === id);

  if (!creature) {
    throw new Error(`Unknown creature id: ${id}`);
  }

  return createCreature(creature) as CreatureInstance;
}
