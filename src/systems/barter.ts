import inquirer from "inquirer";
import chalk from "chalk";
import { SHOP_PRICES } from "../constants.ts";
import type { NPC, Player } from "../types.ts";
import { ITEMS } from "../world/items.ts";

export async function barter(player: Player, actor: NPC) {
  let availableItems: string[] = [];
  const invKeys = Object.keys(actor.inventory || {});
  if (invKeys.length > 0) {
    availableItems = invKeys.filter((id) => {
      const item = ITEMS[id];
      return Boolean(item) && actor.tradesItemType(item.objectType);
    });
  } else {
    availableItems = Object.entries(ITEMS)
      .filter(([, item]) => actor.tradesItemType(item.objectType))
      .map(([id]) => id);
  }

  let shopping = true;
  while (shopping) {
    const { action } = await inquirer.prompt({
      type: "list",
      name: "action",
      message: "Barter Menu:",
      choices: ["Buy Items", "Sell Items", "Exit"],
    });

    switch (action) {
      case "Buy Items":
        await buyItems(player, availableItems);
        break;
      case "Sell Items":
        await sellItems(player, actor);
        break;
      default:
        shopping = false;
    }
  }
}

async function buyItems(player: Player, availableItems: string[]) {
  if (availableItems.length === 0) {
    console.log(chalk.yellow("This merchant has nothing available for trade."));
    return;
  }

  const choices: Array<{ name: string; value: string | null }> =
    availableItems.map((itemId) => {
      const item = ITEMS[itemId];
      const price = Math.ceil(item.value * SHOP_PRICES.BUY_MULTIPLIER);
      return {
        name: `${item.name} - ${price} gold`,
        value: itemId,
      };
    });

  choices.push({ name: "Cancel", value: null });

  const { itemId } = await inquirer.prompt({
    type: "list",
    name: "itemId",
    message: "Select item to buy:",
    choices,
  });

  if (itemId) {
    const item = ITEMS[itemId];
    const price = Math.ceil(item.value * SHOP_PRICES.BUY_MULTIPLIER);

    if (player.gold >= price) {
      player.gold -= price;
      player.addItem(itemId);
      console.log(chalk.green(`Purchased ${item.name}!`));
    } else {
      console.log(chalk.red("Not enough gold!"));
    }
  }
}

async function sellItems(player: Player, actor: NPC) {
  const sellableItems: Array<{ name: string; value: string | null }> =
    Object.entries(player.inventory)
      .filter(([id, count]) => {
        const item = ITEMS[id];
        return (
          count > 0 &&
          Boolean(item) &&
          item.value > 0 &&
          actor.tradesItemType(item.objectType)
        );
      })
      .map(([id, count]) => {
        const item = ITEMS[id];
        const value = Math.floor(item.value * SHOP_PRICES.SELL_MULTIPLIER);
        return {
          name: `${item.name} x${count} - ${value} gold each`,
          value: id,
        };
      });

  if (sellableItems.length === 0) {
    console.log(chalk.yellow("No items to sell!"));
    return;
  }

  sellableItems.push({ name: "Cancel", value: null });

  const { itemId } = await inquirer.prompt({
    type: "list",
    name: "itemId",
    message: "Select item to sell:",
    choices: sellableItems,
  });

  if (itemId) {
    if (player.isItemEquipped(itemId)) {
      player.unequipItemById(itemId);
    }

    const item = ITEMS[itemId];
    const value = Math.floor(item.value * SHOP_PRICES.SELL_MULTIPLIER);
    const { quantity } = await inquirer.prompt({
      type: "input",
      name: "quantity",
      message: `How many to sell? (Max: ${player.inventory[itemId]})`,
      validate: (input) => {
        const num = parseInt(input);
        return (
          (num > 0 && num <= player.inventory[itemId]) || "Invalid quantity"
        );
      },
    });

    const qty = parseInt(quantity);
    player.removeItem(itemId, qty);
    player.gold += value * qty;
    console.log(
      chalk.green(`Sold ${qty}x ${item.name} for ${value * qty} gold!`),
    );
  }
}
