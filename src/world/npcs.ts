import { OBJECT_TYPE, SLOT, SKILL } from "../constants.ts";
import { getNPC } from "../gameState.ts";
import type { NPC, Class } from "../types.ts";

export type NPCRegistryEntry = {
  id: string;
  name: string;
  level?: number;
  classId: string;
  inventory?: Record<string, number>;
};

export const NPC_REGISTRY: NPCRegistryEntry[] = [
  {
    id: "smith",
    name: "Smith",
    level: 1,
    classId: "smith",
    inventory: {
      iron_helmet: -1,
      steel_sword: -1,
    },
  },
  {
    id: "publican",
    name: "Publican",
    level: 1,
    classId: "publican",
    inventory: {
      health_potion: -5,
      mana_potion: -5,
    },
  },
];

function getNPCClass(classId: string, classes: Class[]): Class {
  const npcClass = classes.find((gameClass) => gameClass.id === classId);
  if (!npcClass) {
    throw new Error(`Unknown NPC class: ${classId}`);
  }

  return npcClass;
}

export function createNPC(entry: NPCRegistryEntry, classes: Class[]): NPC {
  const npcClass = getNPCClass(entry.classId, classes);

  const classStats = (npcClass as any).stats as Record<string, number> | undefined;
  return {
    id: entry.id,
    objectType: OBJECT_TYPE.NPC,
    name: entry.name,
    level: entry.level ?? 1,
    class: npcClass,
    equipment: {
      [SLOT.WEAPON]: null,
      [SLOT.ARMOR]: null,
    },
    inventory: Object.fromEntries(
      Object.entries(entry.inventory ?? {}).map(([id]) => [id, Number.POSITIVE_INFINITY]),
    ),
    health: {
      base: classStats?.maxHp ?? 10,
      current: classStats?.hp ?? classStats?.maxHp ?? 10,
    },
    magicka: { base: classStats?.maxMana ?? 0, current: classStats?.mana ?? 0 },
    luck: { base: classStats?.luck ?? 0, current: classStats?.luck ?? 0 },
    strength: {
      base: classStats?.attack ?? 0,
      current: classStats?.attack ?? 0,
    },
    endurance: {
      base: classStats?.defense ?? 0,
      current: classStats?.defense ?? 0,
    },
    intelligence: {
      base: classStats?.magic ?? 0,
      current: classStats?.magic ?? 0,
    },
    skills: new Array(Object.keys(SKILL).length).fill(0),
    aiConfig: {
      barters: npcClass.barters,
      offers: npcClass.offers,
      fight: 0,
    },
    actions: [...npcClass.actions],
    hasItemEquipped: () => false,
    offersServices(service) {
      return Boolean(this.aiConfig.offers[service]);
    },
    tradesItemType(objectType) {
      return Boolean(this.aiConfig.barters[objectType]);
    },
  };
}

function cloneNPC(npc: NPC): NPC {
  return {
    ...npc,
    class: {
      ...npc.class,
      startingItems: [...npc.class.startingItems],
      actions: [...npc.class.actions],
      barters: { ...npc.class.barters },
      offers: { ...npc.class.offers },
    },
    inventory: { ...npc.inventory },
    equipment: { ...npc.equipment },
    aiConfig: {
      ...npc.aiConfig,
      barters: { ...npc.aiConfig.barters },
      offers: { ...npc.aiConfig.offers },
    },
    actions: [...npc.actions],
    skills: npc.skills ? [...npc.skills] : [],
  };
}

export function createNPCInstance(npcId: string): NPC {
  const npc = getNPC(npcId);
  if (!npc) {
    throw new Error(`Missing NPC registry entry for: ${npcId}`);
  }

  return cloneNPC(npc);
}

export default { createNPC, createNPCInstance };
