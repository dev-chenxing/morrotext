import type { AlchemyRegistryEntry } from "../types.ts";
import { OBJECT_TYPE } from "../constants.ts";

export const ALCHEMY: Record<string, AlchemyRegistryEntry> = {
  herbs: { id: "herbs", name: "Medicinal Herbs", objectType: OBJECT_TYPE.ALCHEMY, value: 10 },
  health_potion: {
    id: "health_potion",
    name: "Health Potion",
    objectType: OBJECT_TYPE.ALCHEMY,
    value: 20,
  },
  holy_water: {
    id: "holy_water",
    name: "Holy Water",
    objectType: OBJECT_TYPE.ALCHEMY,
    value: 40,
    description: "Blessed water that harms the unholy",
  },
  mana_potion: {
    id: "mana_potion",
    name: "Mana Potion",
    objectType: OBJECT_TYPE.ALCHEMY,
    value: 35,
  },
  mana_essence: {
    id: "mana_essence",
    name: "Mana Essence",
    objectType: OBJECT_TYPE.ALCHEMY,
    description: "A glowing crystal that pulses with arcane energy",
    value: 75,
  },
};
