import inquirer from "inquirer";
import chalk from "chalk";
import { SHOP_PRICES, GOLD_ID } from "../constants.ts";
import { getObject } from "../gameState.ts";
import type { Armor, Item, NPC, Player, Weapon, Alchemy } from "../types.ts";

type ValuedItem = Alchemy | Armor | Weapon;

function isValuedItem(item: Item | undefined): item is ValuedItem {
  return typeof item === "object" && item !== null && "value" in item;
}

export async function barter(player: Player, actor: NPC) {
  // Ensure NPC restocks any restockable items before showing available items
  actor.inventory.restock();
  const invKeys = actor.inventory.items.map((stack) => stack.object.id);
  const availableItems = invKeys.filter((id) => {
    const item = getObject(id);
    if (!item) return false;

    // only include items the NPC trades and that have >0 available currently
    return actor.tradesItemType(item.objectType) && actor.inventory.contains(id);
  });

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
        await buyItems(player, actor, availableItems);
        break;
      case "Sell Items":
        await sellItems(player, actor);
        break;
      default:
        shopping = false;
    }
  }
}

async function buyItems(player: Player, actor: NPC, availableItems: string[]) {
  if (availableItems.length === 0) {
    console.log(chalk.yellow("This merchant has nothing available for trade."));
    return;
  }

  const choices: Array<{ name: string; value: string | null }> = availableItems.map((itemId) => {
    const item = getObject(itemId);
    if (!isValuedItem(item)) {
      return {
        name: `${itemId} - unavailable`,
        value: null,
      };
    }

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
    const item = getObject(itemId);
    if (!isValuedItem(item)) {
      console.log(chalk.red("That item cannot be purchased."));
      return;
    }

    const price = Math.ceil(item.value * SHOP_PRICES.BUY_MULTIPLIER);

    if (player.inventory.getItemCount(GOLD_ID) >= price) {
      // attempt to remove from merchant inventory first
      const removed = actor.inventory.removeItem(itemId, 1);
      if (removed <= 0) {
        console.log(chalk.red("Item no longer in stock."));
        return;
      }
      player.inventory.removeItem(GOLD_ID, price);
      player.inventory.addItem(itemId, 1);
      console.log(chalk.green(`Purchased ${item.name}!`));
    } else {
      console.log(chalk.red("Not enough gold!"));
    }
  }
}

async function sellItems(player: Player, actor: NPC) {
  const sellableItems = player.inventory.items.reduce<
    Array<{ name: string; value: string | null }>
  >((choices, stack) => {
    const id = stack.object.id;
    const count = stack.count < 0 ? Math.abs(stack.count) : stack.count;
    const item = getObject(id);
    if (
      !isValuedItem(item) ||
      item.value <= 0 ||
      !actor.tradesItemType(item.objectType) ||
      count <= 0
    ) {
      return choices;
    }

    const value = Math.floor(item.value * SHOP_PRICES.SELL_MULTIPLIER);
    choices.push({
      name: `${item.name} x${count} - ${value} gold each`,
      value: id,
    });

    return choices;
  }, []);

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
      player.unequip(itemId);
    }

    const item = getObject(itemId);
    if (!isValuedItem(item)) {
      console.log(chalk.red("That item cannot be sold."));
      return;
    }

    const value = Math.floor(item.value * SHOP_PRICES.SELL_MULTIPLIER);
    const { quantity } = await inquirer.prompt({
      type: "input",
      name: "quantity",
      message: `How many to sell? (Max: ${player.inventory.getItemCount(itemId)})`,
      validate: (input) => {
        const num = parseInt(input);
        return (num > 0 && num <= player.inventory.getItemCount(itemId)) || "Invalid quantity";
      },
    });

    const qty = parseInt(quantity);
    player.inventory.removeItem(itemId, qty);
    // increase merchant stock appropriately (restockable stacks grow, finite stacks increase)
    const stack = actor.inventory.items.find((s) => s.object.id === itemId);
    if (stack) {
      if (stack.count < 0) {
        const newAmount = Math.abs(stack.count) + qty;
        stack.count = -newAmount;
      } else {
        stack.count += qty;
      }
    } else {
      const resolved = getObject(itemId);
      if (resolved) actor.inventory.items.push({ object: resolved, count: qty });
    }
    player.inventory.addItem(GOLD_ID, value * qty);
    console.log(chalk.green(`Sold ${qty}x ${item.name} for ${value * qty} gold!`));
  }
}
