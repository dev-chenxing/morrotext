import inquirer from "inquirer";
import chalk from "chalk";
import { Player } from "../../actors/Player.ts";
import { getObject } from "../../gameState.ts";
import { useItem } from "../../systems/item.ts";

export async function showInventoryMenu(player: Player): Promise<void> {
  const inventoryList = Object.entries(player.inventory)
    .map(([id, count]) => {
      const item = getObject(id);
      if (!item) {
        return null;
      }
      const isEquipped = player.isItemEquipped(id);
      return { name: `${item.name}${isEquipped ? " (Equipped)" : ""} x${count}`, value: id };
    })
    .filter((item): item is { name: string; value: string } => Boolean(item));

  if (inventoryList.length === 0) {
    console.log(chalk.red("\nYour inventory is empty!"));
    return;
  }

  const { itemId } = await inquirer.prompt<{ itemId: string | null }>({
    type: "list",
    name: "itemId",
    message: "Inventory:",
    choices: [...inventoryList, { name: "Return to Menu", value: null }],
  });

  if (!itemId) return;

  const item = getObject(itemId);
  if (item) {
    const result = await useItem(player, itemId);
    if (result) console.log(chalk.yellow(`\n${result}\n`));
  }

  return showInventoryMenu(player);
}
