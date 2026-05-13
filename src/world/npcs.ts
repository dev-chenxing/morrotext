import { OBJECT_TYPE, SLOT } from "../constants.ts";
import type { NPC, Class } from "../types.ts";
import { getClass } from "../systems/class.ts";

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

function getNPCClass(classId: string): Class {
  const npcClass = getClass(classId);
  if (!npcClass) {
    throw new Error(`Unknown NPC class: ${classId}`);
  }

  return npcClass;
}

function createNPC(entry: NPCRegistryEntry): NPC {
  const npcClass = getNPCClass(entry.classId);

  return {
    id: entry.id,
    objectType: OBJECT_TYPE.NPC,
    name: entry.name,
    level: entry.level ?? 1,
    class: npcClass,
    stats: npcClass.stats,
    equipment: {
      [SLOT.WEAPON]: null,
      [SLOT.ARMOR]: null,
      [SLOT.ACCESSORY]: null,
    },
    inventory: Object.fromEntries(
      Object.entries(entry.inventory ?? {}).map(([id]) => [
        id,
        Number.POSITIVE_INFINITY,
      ]),
    ),
    aiConfig: {
      barters: npcClass.barters,
      offers: npcClass.offers,
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
  NPC_REGISTRY.map((entry) => [entry.id, createNPC(entry)]),
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
