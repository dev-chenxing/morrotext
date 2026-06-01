import chalk from "chalk";
import type { MobilePlayer } from "../../../types.ts";
import { useItem } from "../../systems/item.ts";
import { list } from "../prompt.ts";

export async function showInventoryMenu(player: MobilePlayer): Promise<void> {
  const inventoryList = Object.entries(player.inventory)
    .map(([id, count]) => {
      const item = mt.getObject(id);
      if (!item) {
        return null;
      }
      const isEquipped = player.object.hasItemEquipped(id);
      return { name: `${item.name}${isEquipped ? " (Equipped)" : ""} x${count}`, value: id };
    })
    .filter((item): item is { name: string; value: string } => Boolean(item));

  if (inventoryList.length === 0) {
    console.log(chalk.red("\nYour inventory is empty!"));
    return;
  }

  const { itemId } = await list<{ itemId: string | null }>({
    name: "itemId",
    message: "Inventory:",
    choices: [...inventoryList, { name: "Return to Menu", value: null }],
  });

  if (!itemId) return;

  const item = mt.getObject(itemId);
  if (item) {
    const result = await useItem(player, itemId);
    if (result) console.log(chalk.yellow(`\n${result}\n`));
  }

  return showInventoryMenu(player);
}
