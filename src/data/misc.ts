import type { Item } from "../types.ts";
import { OBJECT_TYPE } from "../constants.ts";

export const MISC_ITEMS: Record<string, Item> = {
  gold: {
    id: "gold",
    name: "Gold",
    objectType: OBJECT_TYPE.MISC,
    value: 1,
    description: "A single gold coin.",
  } as Item,

  // Quest Items
  goblin_ear: {
    id: "goblin_ear",
    name: "Goblin Ear",
    objectType: OBJECT_TYPE.MISC,
    value: 5,
    description: "Proof of goblin slaying",
  } as Item,
  ancient_tablet: {
    id: "ancient_tablet",
    name: "Ancient Tablet",
    objectType: OBJECT_TYPE.MISC,
    value: 0,
    description: "Stone slab covered in forgotten runes",
  } as Item,
  deciphered_tablet: {
    id: "deciphered_tablet",
    name: "Deciphered Tablet",
    objectType: OBJECT_TYPE.MISC,
    value: 0,
    description: "A tablet with translated runes showing a map to the artifact chamber",
  } as Item,

  // Materials
  bone_fragment: {
    id: "bone_fragment",
    name: "Bone Fragment",
    objectType: OBJECT_TYPE.MISC,
    value: 15,
    description: "Remains of an ancient skeleton",
  } as Item,
  stone_core: {
    id: "stone_core",
    name: "Stone Core",
    objectType: OBJECT_TYPE.MISC,
    value: 50,
    description: "The magical heart of a stone golem",
  } as Item,
  void_essence: {
    id: "void_essence",
    name: "Void Essence",
    objectType: OBJECT_TYPE.MISC,
    value: 75,
    description: "A shard of pure void energy",
  } as Item,
  wolf_pelt: {
    id: "wolf_pelt",
    name: "Wolf Pelt",
    objectType: OBJECT_TYPE.MISC,
    value: 20,
    description: "Thick fur from a forest wolf",
  } as Item,
  fangs: {
    id: "fangs",
    name: "Wolf Fangs",
    objectType: OBJECT_TYPE.MISC,
    value: 15,
    description: "Sharp teeth from a predator",
  } as Item,
  spider_silk: {
    id: "spider_silk",
    name: "Spider Silk",
    objectType: OBJECT_TYPE.MISC,
    value: 30,
    description: "Incredibly strong and lightweight silk",
  } as Item,
  venom_sac: {
    id: "venom_sac",
    name: "Venom Sac",
    objectType: OBJECT_TYPE.MISC,
    value: 40,
    description: "Toxic substance from a spider",
  } as Item,

  // Books
  dark_tome: {
    id: "dark_tome",
    name: "Dark Tome",
    objectType: OBJECT_TYPE.BOOK,
    value: 150,
    description: "Forbidden knowledge of the void cult",
  } as Item,
};
