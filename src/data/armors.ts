import type { Armor } from "../types.ts";
import { OBJECT_TYPE } from "../constants.ts";

export const ARMORS: Record<string, Armor> = {
  cloth_robe: {
    id: "cloth_robe",
    name: "Cloth Robe",
    objectType: OBJECT_TYPE.ARMOR,
    armorRating: 4,
    value: 30,
    description: "Simple robe favored by spellcasters",
  } as Armor,
  leather_armor: {
    id: "leather_armor",
    name: "Leather Armor",
    objectType: OBJECT_TYPE.ARMOR,
    armorRating: 5,
    value: 40,
  } as Armor,
  chainmail: {
    id: "chainmail",
    name: "Chainmail",
    objectType: OBJECT_TYPE.ARMOR,
    armorRating: 6,
    value: 120,
  } as Armor,
  steel_armor: {
    id: "steel_armor",
    name: "Steel Armor",
    objectType: OBJECT_TYPE.ARMOR,
    armorRating: 10,
    value: 200,
  } as Armor,
  divine_armor: {
    id: "divine_armor",
    name: "Divine Armor",
    objectType: OBJECT_TYPE.ARMOR,
    armorRating: 15,
    value: 400,
    description: "Armor blessed by the gods",
  } as Armor,
};
