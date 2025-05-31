import inquirer from "inquirer";
import { ITEMS } from "../items.js";

export const SHOP_PRICES = {
    buyMultiplier: 1.2,
    sellMultiplier: 0.6
};

export async function openShop(player, shopType) {
    const shopItems = {
        blacksmith: [
            'health_potion', 'steel_sword'
        ],
        general: [
            'health_potion', 'mana_potion'
        ]
    };

    let shopping = true;
    while (shopping) {
        const { action } = await inquirer.prompt({
            type: 'list',
            name: 'action',
            message: 'Shop Menu:',
            choices: [
                'Buy Items',
                'Sell Items',
                'Exit Shop'
            ]
        });

        switch (action) {
            case 'Buy Items':
                await buyItems(player, shopItems[shopType]);
                break;
            case 'Sell Items':
                await sellItems(player);
                break;
            default:
                shopping = false;
        }
    }
}

async function buyItems(player, availableItems) {
    const choices = availableItems.map(itemId => {
        const item = ITEMS[itemId];
        const price = Math.ceil(item.value * SHOP_PRICES.buyMultiplier);
        return {
            name: `${item.name} - ${price} gold`,
            value: itemId
        };
    });

    choices.push({ name: 'Cancel', value: null });

    const { itemId } = await safePrompt({
        type: 'list',
        name: 'itemId',
        message: 'Select item to buy:',
        choices
    });

    if (itemId) {
        const item = ITEMS[itemId];
        const price = Math.ceil(item.value * SHOP_PRICES.buyMultiplier);

        if (player.gold >= price) {
            player.gold -= price;
            player.addItem(itemId);
            console.log(chalk.green(`Purchased ${item.name}!`));
        } else {
            console.log(chalk.red('Not enough gold!'));
        }
    }
}

async function sellItems(player) {
    const sellableItems = Object.entries(player.inventory)
        .filter(([id, count]) => count > 0 && ITEMS[id].value > 0)
        .map(([id, count]) => {
            const item = ITEMS[id];
            const value = Math.floor(item.value * SHOP_PRICES.sellMultiplier);
            return {
                name: `${item.name} x${count} - ${value} gold each`,
                value: id
            };
        });

    if (sellableItems.length === 0) {
        console.log(chalk.yellow('No items to sell!'));
        return;
    }

    sellableItems.push({ name: 'Cancel', value: null });

    const { itemId } = await safePrompt({
        type: 'list',
        name: 'itemId',
        message: 'Select item to sell:',
        choices: sellableItems
    });

    if (itemId) {
        const item = ITEMS[itemId];
        const value = Math.floor(item.value * SHOP_PRICES.sellMultiplier);
        const { quantity } = await safePrompt({
            type: 'input',
            name: 'quantity',
            message: `How many to sell? (Max: ${player.inventory[itemId]})`,
            validate: input => {
                const num = parseInt(input);
                return (num > 0 && num <= player.inventory[itemId]) || 'Invalid quantity';
            }
        });

        const qty = parseInt(quantity);
        player.removeItem(itemId, qty);
        player.gold += value * qty;
        console.log(chalk.green(`Sold ${qty}x ${item.name} for ${value * qty} gold!`));
    }
}