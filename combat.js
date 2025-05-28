import chalk from "chalk";
import inquirer from "inquirer";
import { generateLoot } from "./loot.js";
import { CLASSES } from "./classes.js";
import { ITEMS } from "./items.js";

function getActionChoices(player) {
  let choices = ["Attack", "Use Item"];

  if (player.class === "mage") {
    const { manaCost, damageMultiplier } = CLASSES.mage.abilities.fireball;
    choices.push({
      name: `Fireball (${manaCost} mana) - ${player.magic * damageMultiplier} damage`,
      value: "fireball"
    });
  }

  if (player.class === "cleric") {
    const healCost = CLASSES.cleric.abilities.divineHeal.manaCost;
    choices.push({ name: `Divine Heal (${healCost} mana)`, value: "divineHeal" });
  }

  return choices;
}

export async function startCombat(player, enemy) {
  console.log(chalk.red(`\nA wild ${enemy.name} appears!`));

  while (player.hp > 0 && enemy.hp > 0) {
    const { action } = await inquirer.prompt({
      type: "list",
      name: "action",
      message: "Choose your action:",
      choices: getActionChoices(player)
    });

    switch (action) {
      case "Attack":
        const playerDmg = Math.max(0, player.attack - enemy.defense);
        enemy.hp -= playerDmg;
        console.log(chalk.red(`You dealt ${playerDmg} damage!`));

        const enemyDmg = Math.max(0, enemy.attack - player.defense);
        player.hp -= enemyDmg;
        console.log(chalk.yellow(`${enemy.name} dealt ${enemyDmg} damage!`));
        break;

      case "Use Item":
        const { item } = await inquirer.prompt({
          type: "list",
          name: "item",
          message: "Select item:",
          choices: [...player.inventory, "Cancel"]
        });

        if (item !== "Cancel") {
          // Handle item usage logic
          return startCombat(player, enemy); // Refresh combat state
        }
        break;

      case "divineHeal":
        if (player.divineHeal()) {
          // Healing doesn't trigger enemy attack
          console.log(chalk.cyan(`\n${player.name}: ${player.hp}HP`));
          continue;
        }
        break;

      case "fireball":
        const fireDmg = player.castFireball();
        if (fireDmg > 0) {
          enemy.hp -= fireDmg;
          console.log(chalk.red(`Fireball deals ${fireDmg} damage!`));
        }
        break;
    }

    // Combat status update
    console.log(chalk.cyan(`\n${player.name}: ${player.hp}HP`));
    console.log(chalk.cyan(`${enemy.name}: ${enemy.hp}HP\n`));
  }

  // Victory handling
  if (player.hp > 0) {
    const expGained = enemy.exp;
    player.addExp(expGained);
    console.log(chalk.cyan(`Gained ${expGained} experience!`));

    const gold = enemy.gold();
    console.log(chalk.green(`\nVictory! Gained ${gold} gold!`));
    player.gold += gold;

    // Enemy-specific loot drops
    if (enemy.loot) {
      enemy.loot.forEach(itemId => {
        if (Math.random() < 0.65) {
          const item = ITEMS[itemId];
          player.inventory.push(itemId);
          console.log(chalk.blue(`Found ${item.name}!`));
        }
      });
    }

    // Procedural loot generation
    const lootId = generateLoot();
    const proceduralItem = ITEMS[lootId];
    player.inventory.push(lootId);
    console.log(chalk.blue(`Found ${proceduralItem.name}!`));
  } else {
    console.log(chalk.red("\nGAME OVER"));
    process.exit();
  }
}

// Enemy data
export const ENEMIES = {
  goblin: {
    name: "Goblin",
    hp: 45,
    attack: 12,
    defense: 6,
    exp: 35,
    loot: ["rusty_dagger", "goblin_ear"],
    gold: () => Math.floor(Math.random() * 16) + 10 // Returns 10-25 gold
  },
  goblin_shaman: {
    name: "Goblin Shaman",
    hp: 65,
    attack: 18,
    defense: 7,
    exp: 80,
    loot: ["mana_essence", "bone_charm"],
    gold: () => Math.floor(Math.random() * 21) + 30 // Returns 30-50 gold
  }
};

export function createEnemy(type) {
  return { ...ENEMIES[type] };
}
