import type { Alchemy, Armor, Weapon, Item } from "../types.ts";
import { OBJECT_TYPE } from "../constants.ts";

export type AnyItem = Alchemy | Armor | Weapon | Item;

export const ITEMS: Record<string, AnyItem> = {
  gold: {
    id: "gold",
    name: "Gold",
    objectType: OBJECT_TYPE.MISC,
    value: 1,
    description: "A single gold coin.",
  } as Item,
  herbs: {
    id: "herbs",
    name: "Medicinal Herbs",
    objectType: OBJECT_TYPE.ALCHEMY,
    effect: { hp: 20 },
    value: 10,
  } as Alchemy,
  health_potion: {
    id: "health_potion",
    name: "Health Potion",
    objectType: OBJECT_TYPE.ALCHEMY,
    value: 20,
  } as Alchemy,
  holy_water: {
    id: "holy_water",
    name: "Holy Water",
    objectType: OBJECT_TYPE.ALCHEMY,
    value: 40,
    description: "Blessed water that harms the unholy",
  } as Alchemy,
  mana_potion: {
    id: "mana_potion",
    name: "Mana Potion",
    objectType: OBJECT_TYPE.ALCHEMY,
    value: 35,
  } as Alchemy,
  mana_essence: {
    id: "mana_essence",
    name: "Mana Essence",
    objectType: OBJECT_TYPE.ALCHEMY,
    description: "A glowing crystal that pulses with arcane energy",
    value: 75,
  } as Alchemy,

  // Weapons
  rusty_dagger: {
    id: "rusty_dagger",
    name: "Rusty Dagger",
    objectType: OBJECT_TYPE.WEAPON,
    min: 4,
    max: 4,
    value: 15,
  } as Weapon,
  rusty_sword: {
    id: "rusty_sword",
    name: "Rusty Sword",
    objectType: OBJECT_TYPE.WEAPON,
    min: 5,
    max: 5,
    value: 15,
    description: "A corroded blade that has seen better days",
  } as Weapon,
  iron_sword: {
    id: "iron_sword",
    name: "Iron Sword",
    objectType: OBJECT_TYPE.WEAPON,
    min: 6,
    max: 6,
    value: 50,
  } as Weapon,
  oak_staff: {
    id: "oak_staff",
    name: "Oak Staff",
    objectType: OBJECT_TYPE.WEAPON,
    min: 7,
    max: 7,
    value: 80,
  } as Weapon,
  steel_sword: {
    id: "steel_sword",
    name: "Steel Sword",
    objectType: OBJECT_TYPE.WEAPON,
    min: 8,
    max: 8,
    value: 75,
  } as Weapon,
  mace: {
    id: "mace",
    name: "Sacred Mace",
    objectType: OBJECT_TYPE.WEAPON,
    min: 10,
    max: 10,
    value: 100,
  } as Weapon,
  steel_dagger: {
    id: "steel_dagger",
    name: "Steel Dagger",
    objectType: OBJECT_TYPE.WEAPON,
    min: 12,
    max: 12,
    value: 85,
  } as Weapon,
  seraphim_staff: {
    id: "seraphim_staff",
    name: "Seraphim Staff",
    objectType: OBJECT_TYPE.WEAPON,
    min: 8,
    max: 12,
    value: 450,
  } as Weapon,
  masterwork_hammer: {
    id: "masterwork_hammer",
    name: "Masterwork Hammer",
    objectType: OBJECT_TYPE.WEAPON,
    min: 15,
    max: 15,
    value: 300,
    description: "Exceptional hammer",
  } as Weapon,
  dragon_slayer: {
    id: "dragon_slayer",
    name: "Dragon Slayer",
    objectType: OBJECT_TYPE.WEAPON,
    min: 18,
    max: 18,
    value: 500,
  } as Weapon,

  // Armors
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

export default ITEMS;
