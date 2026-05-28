import type { MiscRegistryEntry } from "../types.ts";
import { OBJECT_TYPE } from "../constants.ts";

export const MISC_ITEMS: Record<string, MiscRegistryEntry> = {
  gold: {
    id: "gold",
    name: "Gold",
    objectType: OBJECT_TYPE.MISC,
    value: 1,
    description: "A single gold coin.",
  },

  common_shirt: {
    id: "common_shirt",
    name: "common shirt",
    objectType: OBJECT_TYPE.MISC,
    value: 1,
    description: "A plain shirt issued to prisoners upon release.",
  },
  common_pants: {
    id: "common_pants",
    name: "common pants",
    objectType: OBJECT_TYPE.MISC,
    value: 1,
    description: "Simple trousers suitable for a newly released prisoner.",
  },
  common_shoes: {
    id: "common_shoes",
    name: "common shoes",
    objectType: OBJECT_TYPE.MISC,
    value: 1,
    description: "Plain walking shoes with worn soles.",
  },
  directions_to_caius_cosades: {
    id: "directions_to_caius_cosades",
    name: "Directions to Caius Cosades",
    objectType: OBJECT_TYPE.BOOK,
    value: 0,
    description: "A note from Glabrio Bellienus directing you to Caius Cosades in Balmora.",
  },
  package_for_caius_cosades: {
    id: "package_for_caius_cosades",
    name: "Package for Caius Cosades",
    objectType: OBJECT_TYPE.MISC,
    value: 0,
    description: "A sealed package containing ciphered Imperial correspondence.",
  },

  // Quest Items
  goblin_ear: {
    id: "goblin_ear",
    name: "Goblin Ear",
    objectType: OBJECT_TYPE.MISC,
    value: 5,
    description: "Proof of goblin slaying",
  },
  ancient_tablet: {
    id: "ancient_tablet",
    name: "Ancient Tablet",
    objectType: OBJECT_TYPE.MISC,
    value: 0,
    description: "Stone slab covered in forgotten runes",
  },
  deciphered_tablet: {
    id: "deciphered_tablet",
    name: "Deciphered Tablet",
    objectType: OBJECT_TYPE.MISC,
    value: 0,
    description: "A tablet with translated runes showing a map to the artifact chamber",
  },

  // Materials
  bone_fragment: {
    id: "bone_fragment",
    name: "Bone Fragment",
    objectType: OBJECT_TYPE.MISC,
    value: 15,
    description: "Remains of an ancient skeleton",
  },
  stone_core: {
    id: "stone_core",
    name: "Stone Core",
    objectType: OBJECT_TYPE.MISC,
    value: 50,
    description: "The magical heart of a stone golem",
  },
  void_essence: {
    id: "void_essence",
    name: "Void Essence",
    objectType: OBJECT_TYPE.MISC,
    value: 75,
    description: "A shard of pure void energy",
  },
  wolf_pelt: {
    id: "wolf_pelt",
    name: "Wolf Pelt",
    objectType: OBJECT_TYPE.MISC,
    value: 20,
    description: "Thick fur from a forest wolf",
  },
  fangs: {
    id: "fangs",
    name: "Wolf Fangs",
    objectType: OBJECT_TYPE.MISC,
    value: 15,
    description: "Sharp teeth from a predator",
  },
  spider_silk: {
    id: "spider_silk",
    name: "Spider Silk",
    objectType: OBJECT_TYPE.MISC,
    value: 30,
    description: "Incredibly strong and lightweight silk",
  },
  venom_sac: {
    id: "venom_sac",
    name: "Venom Sac",
    objectType: OBJECT_TYPE.MISC,
    value: 40,
    description: "Toxic substance from a spider",
  },

  // Books
  dark_tome: {
    id: "dark_tome",
    name: "Dark Tome",
    objectType: OBJECT_TYPE.BOOK,
    value: 150,
    description: "Forbidden knowledge of the void cult",
  },
};
