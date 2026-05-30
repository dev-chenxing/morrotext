import type { NPCRegistryEntry } from "../../data/npcs.ts";
import { ATTRIBUTES, OBJECT_TYPE, SLOT } from "../../constants.ts";
import type { NPC, NPCInstance } from "../../types.ts";
import { createClassActorProfile } from "./class.ts";
import { cloneInventory, createInventoryFromRecord } from "./inventory.ts";

export function createNPC(entry: NPCRegistryEntry): NPC {
  const npcClass = mt.getClass(entry.classId);
  if (!npcClass) {
    throw new Error(`Missing class for NPC ${entry.id}: ${entry.classId}`);
  }
  const classProfile = createClassActorProfile(npcClass);

  return {
    id: entry.id,
    objectType: OBJECT_TYPE.NPC,
    barterGold: 0,
    name: entry.name,
    description: entry.description ?? "",
    fight: 0,
    level: entry.level ?? 1,
    class: npcClass,
    equipment: { [SLOT.WEAPON]: null, [SLOT.ARMOR]: null },
    inventory: createInventoryFromRecord(entry.inventory ?? {}),
    health: { ...classProfile.health },
    magicka: { ...classProfile.magicka },
    luck: { ...classProfile.attributes[ATTRIBUTES.LUCK] },
    strength: { ...classProfile.attributes[ATTRIBUTES.STRENGTH] },
    intelligence: { ...classProfile.attributes[ATTRIBUTES.INTELLIGENCE] },
    willpower: { ...classProfile.attributes[ATTRIBUTES.WILLPOWER] },
    agility: { ...classProfile.attributes[ATTRIBUTES.AGILITY] },
    speed: { ...classProfile.attributes[ATTRIBUTES.SPEED] },
    endurance: { ...classProfile.attributes[ATTRIBUTES.ENDURANCE] },
    personality: { ...classProfile.attributes[ATTRIBUTES.PERSONALITY] },
    skills: [...classProfile.skills],
    aiConfig: { barters: npcClass.barters, offers: npcClass.offers, fight: 0 },
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

function cloneNPC(npc: NPC): NPCInstance {
  return {
    ...npc,
    class: {
      ...npc.class,
      attributes: [...npc.class.attributes],
      majorSkills: [...npc.class.majorSkills],
      minorSkills: [...npc.class.minorSkills],
      actions: [...npc.class.actions],
      barters: { ...npc.class.barters },
      offers: { ...npc.class.offers },
    },
    inventory: cloneInventory(npc.inventory),
    equipment: { ...npc.equipment },
    aiConfig: {
      ...npc.aiConfig,
      barters: { ...npc.aiConfig.barters },
      offers: { ...npc.aiConfig.offers },
    },
    actions: [...npc.actions],
    skills: npc.skills ? [...npc.skills] : [],
  } as NPCInstance;
}

export function createNPCInstance(npcId: string): NPCInstance {
  const npc =
    mt.dataHandler.nonDynamicData.objects.find(
      (object): object is NPC => object.objectType === OBJECT_TYPE.NPC && object.id === npcId,
    ) ?? null;
  if (!npc) {
    throw new Error(`Missing NPC registry entry for: ${npcId}`);
  }
  return cloneNPC(npc);
}
