import { CLASSES } from "../classes.ts";
import { OBJECT_TYPE, SLOT } from "../constants.ts";
import type { Class, NPC } from "../types.ts";

type NPCRegistryEntry = {
  id: string;
  name: string;
  level?: number;
  classId: string;
  inventory?: Record<string, number>;
};

const NPC_REGISTRY: NPCRegistryEntry[] = [
  {
    id: "smith",
    name: "Smith",
    level: 1,
    classId: "smith",
    inventory: {
      iron_helmet: 999,
      steel_sword: 999,
    },
  },
  {
    id: "publican",
    name: "Publican",
    level: 1,
    classId: "publican",
    inventory: {
      health_potion: 999,
      mana_potion: 999,
    },
  },
];

function getNPCClass(classId: string): Class {
  const classEntry = CLASSES.find((entry) => entry.id === classId);
  if (!classEntry) {
    throw new Error(`Unknown NPC class: ${classId}`);
  }

  return {
    id: classEntry.id,
    objectType: OBJECT_TYPE.ACTOR,
    name: classEntry.name,
    stats: {
      attack: classEntry.stats?.attack ?? 0,
      defense: classEntry.stats?.defense ?? 0,
      maxHp: classEntry.stats?.maxHp ?? 1,
      magic: classEntry.stats?.magic,
      maxMana: classEntry.stats?.maxMana,
      luck: classEntry.stats?.luck,
    },
    startingItems: classEntry.startingItems ?? [],
    actions: {},
    barters: classEntry.barters,
    offers: classEntry.offers,
    description: classEntry.description,
    playable: classEntry.playable,
  };
}

function createNPC(entry: NPCRegistryEntry): NPC {
  const npcClass = getNPCClass(entry.classId);

  return {
    id: entry.id,
    objectType: OBJECT_TYPE.NPC,
    name: entry.name,
    level: entry.level ?? 1,
    class: npcClass,
    stats: {
      hp: npcClass.stats.maxHp,
      maxHp: npcClass.stats.maxHp,
      attack: npcClass.stats.attack,
      defense: npcClass.stats.defense,
      magic: npcClass.stats.magic ?? 0,
      maxMana: npcClass.stats.maxMana ?? 0,
      mana: npcClass.stats.maxMana ?? 0,
      luck: npcClass.stats.luck ?? 0,
    },
    equipment: {
      [SLOT.WEAPON]: null,
      [SLOT.ARMOR]: null,
      [SLOT.ACCESSORY]: null,
    },
    inventory: { ...entry.inventory },
    aiConfig: {
      barters: { ...(npcClass.barters ?? {}) },
      offers: { ...(npcClass.offers ?? {}) },
      fight: 0,
    },
    actions: [],
    hasItemEquipped: () => false,
    offersServices(service) {
      return Boolean(this.aiConfig.offers[service]);
    },
    tradesItemType(objectType) {
      return Boolean(this.aiConfig.barters[objectType]);
    },
  };
}

export const NPCS: Record<string, NPC> = Object.fromEntries(
  Object.entries(NPC_REGISTRY).map(([key, entry]) => [key, createNPC(entry)]),
) as Record<string, NPC>;

export function getNPC(npcId: string): NPC {
  const npc = NPCS[npcId];
  if (!npc) {
    throw new Error(`Missing NPC registry entry for: ${npcId}`);
  }

  return {
    ...npc,
    inventory: { ...npc.inventory },
    equipment: { ...npc.equipment },
    aiConfig: {
      ...npc.aiConfig,
      barters: { ...npc.aiConfig.barters },
      offers: { ...npc.aiConfig.offers },
    },
    actions: [...npc.actions],
  };
}

export default NPCS;
