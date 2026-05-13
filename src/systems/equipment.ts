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
    // `value` exists on valued item subtypes (weapon/armor/alchemy)
    if ("value" in (item as any)) console.log(`Value: ${(item as any).value} gold`);
    // Show armor rating for armor items
    if ("armorRating" in (item as any)) console.log(`Armor: ${(item as any).armorRating}`);
    // Show generic stats for items that expose a `stats` map (accessories, etc.)
    if ("stats" in (item as any) && (item as any).stats)
      Object.entries((item as any).stats).forEach(([stat, val]) =>
        console.log(`${stat}: ${val > 0 ? "+" : ""}${val}`),
      );
    if (item.description) console.log(`\n${item.description}`);
    return handleEquipment(player, item); // Return to options
  }
}

export default handleEquipment;
