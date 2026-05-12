import inquirer from "inquirer";
import chalk from "chalk";
import { CREATURE_TYPE, OBJECT_TYPE, SLOT } from "./constants.ts";
import type { Item, Player } from "./types.ts";
import type { ValueOf } from "./types.ts";

function getSlotForItemType(item: Item): SLOT | null {
  switch (item.objectType) {
    case OBJECT_TYPE.WEAPON:
      return SLOT.WEAPON;
    case OBJECT_TYPE.ARMOR:
      return SLOT.ARMOR;
    case OBJECT_TYPE.ACCESSORY:
      return SLOT.ACCESSORY;
    default:
      return null;
  }
}

async function handleEquipment(player: Player, item: Item) {
  const isEquipped = player.isItemEquipped(item.id);

  const choices = [];

  if (isEquipped) {
    choices.push({
      name: "Unequip",
      value: "unequip",
    });
  } else if (getSlotForItemType(item)) {
    choices.push({
      name: "Equip",
      value: "equip",
    });
  }

  choices.push(
    { name: "Inspect", value: "inspect" },
    { name: "Cancel", value: "cancel" },
  );

  const { action } = await inquirer.prompt({
    type: "list",
    name: "action",
    message: `What to do with ${item.name}?`,
    choices,
  });

  if (action === "equip") {
    player.equipItem(item);
  } else if (action === "unequip") {
    player.unequipItem(item);
  } else if (action === "inspect") {
    console.log(chalk.yellow(`\n${item.name}:`));
    console.log(`Type: ${item.objectType}`);
    console.log(`Value: ${item.value} gold`);
    if (item.stats)
      Object.entries(item.stats).forEach(([stat, val]) =>
        console.log(`${stat}: ${val > 0 ? "+" : ""}${val}`),
      );
    if (item.description) console.log(`\n${item.description}`);
    return handleEquipment(player, item); // Return to options
  }
}

export async function useItem(
  player: Player,
  itemId: string,
  enemy: {
    type?: ValueOf<typeof CREATURE_TYPE>;
    hp?: number;
    name?: string;
  } | null = null,
): Promise<string | null> {
  const item = ITEMS[itemId];
  if (!item) return "Item not found.";

  let message = null;

  switch (item.objectType) {
    case OBJECT_TYPE.ALCHEMY:
      if (item.effect) {
        if (item.effect.hp) {
          const oldHP = player.stats.hp;
          player.stats.hp = Math.min(
            player.stats.maxHp,
            player.stats.hp + item.effect.hp,
          );
          message = `Restored ${player.stats.hp - oldHP} HP!`;
        }
        if (item.effect.mana) {
          const oldMana = player.stats.mana;
          player.stats.mana = Math.min(
            player.stats.maxMana,
            player.stats.mana + item.effect.mana,
          );
          message = `Restored ${player.stats.mana - oldMana} mana!`;
        }
        if (item.effect.damageUndead) {
          if (enemy && enemy.type === CREATURE_TYPE.UNDEAD) {
            const damage = item.effect.damageUndead;
            if (typeof enemy.hp === "number") {
              enemy.hp = Math.max(0, enemy.hp - damage);
            }
            message = `The holy water burns ${enemy.name || "the enemy"} for ${damage} damage!`;
          }
        }
      }
      break;

    case OBJECT_TYPE.WEAPON:
    case OBJECT_TYPE.ARMOR:
    case OBJECT_TYPE.ACCESSORY:
      await handleEquipment(player, item);
      break;

    default:
      message = "You can't use that item right now.";
  }

  // Remove alchemy items after use
  if (item.objectType === OBJECT_TYPE.ALCHEMY) {
    player.removeItem(itemId);
  }

  return message;
}

export const ITEMS: Record<string, Item> = {
  herbs: {
    id: "herbs",
    name: "Medicinal Herbs",
    objectType: OBJECT_TYPE.ALCHEMY,
    effect: { hp: 20 },
    value: 10,
  },
  health_potion: {
    id: "health_potion",
    name: "Health Potion",
    objectType: OBJECT_TYPE.ALCHEMY,
    effect: { hp: 30 },
    value: 20,
  },
  holy_water: {
    id: "holy_water",
    name: "Holy Water",
    objectType: OBJECT_TYPE.ALCHEMY,
    effect: { damageUndead: 20 },
    value: 40,
    description: "Blessed water that harms the unholy",
  },
  mana_potion: {
    id: "mana_potion",
    name: "Mana Potion",
    objectType: OBJECT_TYPE.ALCHEMY,
    effect: { mana: 30 },
    value: 35,
  },
  mana_essence: {
    id: "mana_essence",
    name: "Mana Essence",
    objectType: OBJECT_TYPE.ALCHEMY,
    description: "A glowing crystal that pulses with arcane energy",
    value: 75,
    effect: { mana: 50 },
  },

  // Weapons
  rusty_dagger: {
    id: "rusty_dagger",
    name: "Rusty Dagger",
    objectType: OBJECT_TYPE.WEAPON,
    stats: { attack: 4 },
    value: 15,
  },
  rusty_sword: {
    id: "rusty_sword",
    name: "Rusty Sword",
    objectType: OBJECT_TYPE.WEAPON,
    stats: { attack: 5 },
    value: 15,
    description: "A corroded blade that has seen better days",
  },
  iron_sword: {
    id: "iron_sword",
    name: "Iron Sword",
    objectType: OBJECT_TYPE.WEAPON,
    stats: { attack: 6 },
    value: 50,
  },
  oak_staff: {
    id: "oak_staff",
    name: "Oak Staff",
    objectType: OBJECT_TYPE.WEAPON,
    stats: { magic: 7 },
    value: 80,
  },
  steel_sword: {
    id: "steel_sword",
    name: "Steel Sword",
    objectType: OBJECT_TYPE.WEAPON,
    stats: { attack: 8 },
    value: 75,
  },
  mace: {
    id: "mace",
    name: "Sacred Mace",
    objectType: OBJECT_TYPE.WEAPON,
    stats: { attack: 10 },
    value: 100,
  },
  steel_dagger: {
    id: "steel_dagger",
    name: "Steel Dagger",
    objectType: OBJECT_TYPE.WEAPON,
    stats: { attack: 12 },
    value: 85,
  },
  seraphim_staff: {
    id: "seraphim_staff",
    name: "Seraphim Staff",
    objectType: OBJECT_TYPE.WEAPON,
    stats: { attack: 8, magic: 12 },
    value: 450,
  },
  masterwork_hammer: {
    id: "masterwork_hammer",
    name: "Masterwork Hammer",
    objectType: OBJECT_TYPE.WEAPON,
    stats: { attack: 15 },
    value: 300,
    description: "Exceptional hammer",
  },
  dragon_slayer: {
    id: "dragon_slayer",
    name: "Dragon Slayer",
    objectType: OBJECT_TYPE.WEAPON,
    stats: { attack: 18 },
    value: 500,
  },

  // Armors
  cloth_robe: {
    id: "cloth_robe",
    name: "Cloth Robe",
    objectType: OBJECT_TYPE.ARMOR,
    stats: { defense: 4, magic: 2 },
    value: 30,
    description: "Simple robe favored by spellcasters",
  },
  leather_armor: {
    id: "leather_armor",
    name: "Leather Armor",
    objectType: OBJECT_TYPE.ARMOR,
    stats: { defense: 5 },
    value: 40,
  },
  chainmail: {
    id: "chainmail",
    name: "Chainmail",
    objectType: OBJECT_TYPE.ARMOR,
    stats: { defense: 6 },
    value: 120,
  },
  steel_armor: {
    id: "steel_armor",
    name: "Steel Armor",
    objectType: OBJECT_TYPE.ARMOR,
    stats: { defense: 10 },
    value: 200,
  },
  divine_armor: {
    id: "divine_armor",
    name: "Divine Armor",
    objectType: OBJECT_TYPE.ARMOR,
    stats: { defense: 15, maxHp: 50 },
    value: 400,
    description: "Armor blessed by the gods",
  },

  // Accessory
  iron_helmet: {
    id: "iron_helmet",
    name: "Iron Helmet",
    objectType: OBJECT_TYPE.ACCESSORY,
    stats: { defense: 3 },
    value: 60,
  },
  holy_symbol: {
    id: "holy_symbol",
    name: "Holy Symbol",
    objectType: OBJECT_TYPE.ACCESSORY,
    stats: { magic: 5, defense: 3 },
    value: 150,
  },
  magic_amulet: {
    id: "magic_amulet",
    name: "Magic Amulet",
    objectType: OBJECT_TYPE.ACCESSORY,
    stats: { defense: 5, magic: 5 },
    value: 150,
    description: "An amulet that enhances magical abilities",
  },
  crown_of_wisdom: {
    id: "crown_of_wisdom",
    name: "Crown of Wisdom",
    description: "A pulsating relic of immense power",
    objectType: OBJECT_TYPE.ACCESSORY,
    stats: { defense: 10, magic: 10, maxHp: 50 },
    value: 0,
  },
  bone_charm: {
    id: "bone_charm",
    name: "Bone Charm",
    objectType: OBJECT_TYPE.ACCESSORY,
    description: "A talisman carved from ancient bones, radiating dark power",
    stats: { magic: 3, luck: 2 },
    value: 120,
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
    description:
      "A tablet with translated runes showing a map to the artifact chamber",
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
