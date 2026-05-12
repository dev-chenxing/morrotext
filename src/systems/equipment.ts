import inquirer from "inquirer";
import chalk from "chalk";
import { SLOT, OBJECT_TYPE } from "../constants.ts";
import type { Item, Player } from "../types.ts";

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

export async function handleEquipment(player: Player, item: Item) {
  const isEquipped = player.isItemEquipped(item.id);

  const choices: Array<{ name: string; value: string }> = [];

  if (isEquipped) {
    choices.push({ name: "Unequip", value: "unequip" });
  } else if (getSlotForItemType(item)) {
    choices.push({ name: "Equip", value: "equip" });
  }

  choices.push({ name: "Inspect", value: "inspect" }, { name: "Cancel", value: "cancel" });

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

export default handleEquipment;
