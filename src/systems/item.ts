import inquirer from "inquirer";
import chalk from "chalk";
import { CREATURE_TYPE, OBJECT_TYPE, SLOT } from "../constants.ts";
import type { Item, Player, ValueOf } from "../types.ts";
import { ITEMS } from "../world/items.ts";

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
