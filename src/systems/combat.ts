import chalk from "chalk";
import inquirer from "inquirer";
import { generateLoot } from "../world/loot.ts";
import { CLASSES } from "../classes.ts";
import { ITEMS, useItem } from "../items.ts";
import type { Player } from "../actors/Player.ts";
import type { Actor, Enemy, Area } from "../types.ts";

function getActionChoices(
  player: Player,
): Array<{ name: string; value: string }> {
  const choices = [
    { name: "Attack", value: "Attack" },
    { name: "Use Item", value: "Use Item" },
  ];

  if (player.class === "mage") {
    const fireball = CLASSES.mage.abilities?.fireball;
    if (fireball) {
      choices.push({
        name: fireball.description,
        value: "fireball",
      });
    }
  }

  if (player.class === "cleric") {
    const divineHeal = CLASSES.cleric.abilities?.divineHeal;
    if (divineHeal) {
      choices.push({ name: divineHeal.description, value: "divineHeal" });
    }
  }

  return choices;
}

function calculateDamage(attacker: Actor, defender: Actor) {
  // Base damage + 10% random variance
  const baseDamage = attacker.attack * (0.9 + Math.random() * 0.2);

  // Critical hit chance (5% base + luck factor)
  const critChance = 0.05 + (attacker.luck || 0) / 100;
  const isCrit = Math.random() < critChance;

  const damage = Math.max(
    1,
    Math.floor(baseDamage - defender.defense * (0.8 + Math.random() * 0.4)),
  );

  return { damage, isCrit };
}

function formatCombatStatus(entity: Pick<Actor, "name" | "hp">) {
  // Ensure HP never shows negative and add space
  const currentHP = Math.max(0, entity.hp);
  return `${entity.name}: ${currentHP} HP`;
}

function updateBattleDisplay(player: Player, enemy: Enemy) {
  console.log(chalk.cyan("\n==== BATTLE ===="));
  console.log(chalk.green(formatCombatStatus(player)));
  console.log(chalk.red(formatCombatStatus(enemy)));
  console.log(chalk.cyan("================\n"));
}

function applyDamage(target: Pick<Actor, "hp">, damage: number) {
  const newHP = Math.max(0, target.hp - damage);
  const actualDamage = target.hp - newHP;
  target.hp = newHP;
  return actualDamage;
}

export async function startCombat(
  player: Player,
  enemy: Enemy,
  area: Area,
) {
  console.log(chalk.red(`\nA wild ${enemy.name} appears!`));

  updateBattleDisplay(player, enemy);

  while (player.hp > 0 && enemy.hp > 0) {
    const { action } = await inquirer.prompt({
      type: "list",
      name: "action",
      message: "Choose your action:",
      choices: getActionChoices(player),
    });

    switch (action) {
      case "Attack":
        const { damage: playerDmg, isCrit: playerCrit } = calculateDamage(
          player,
          enemy,
        );
        applyDamage(enemy, playerDmg);
        console.log(
          chalk.red(
            `You deal ${playerDmg} damage${playerCrit ? " CRITICAL HIT!" : ""}!`,
          ),
        );

        // Enemy counterattack
        const { damage: enemyDmg, isCrit: enemyCrit } = calculateDamage(
          enemy,
          player,
        );
        applyDamage(player, enemyDmg);
        console.log(
          chalk.yellow(
            `${enemy.name} deals ${enemyDmg} damage${enemyCrit ? " CRITICAL HIT!" : ""}!`,
          ),
        );
        break;

      case "Use Item":
        const inventoryList = Object.entries(player.inventory)
          .filter(([id]) => ITEMS[id]?.type === "consumable")
          .map(([id, count]) => {
            const item = ITEMS[id];
            return {
              name: `${item.name} x${count}`,
              value: id,
            };
          });
        const { itemId } = await inquirer.prompt({
          type: "list",
          name: "itemId",
          message: "Select item:",
          choices: [...inventoryList, { name: "Cancel", value: null }],
        });

        if (itemId) {
          const result = await useItem(player, itemId, enemy);
          if (result) console.log(chalk.yellow(result));
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
    updateBattleDisplay(player, enemy);
  }

  // Victory handling
  if (player.hp > 0) {
    player.recordKill(enemy.type ?? enemy.name);

    const gold = enemy.gold();
    console.log(chalk.green(`Victory! Gained ${gold} gold!`));
    player.gold += gold;

    // Enemy-specific loot drops
    if (enemy.loot) {
      enemy.loot.forEach((itemId) => {
        if (Math.random() < 0.65) {
          const item = ITEMS[itemId];
          player.addItem(itemId);
          console.log(chalk.blue(`Found ${item.name}!`));
        }
      });
    }

    // Procedural loot generation
    const lootId = area.lootTable ? generateLoot(area.lootTable) : null;
    if (lootId) {
      const proceduralItem = ITEMS[lootId];
      player.addItem(lootId);
      console.log(chalk.blue(`Found ${proceduralItem.name}!`));
    }

    const expGained = enemy.exp;
    player.addExp(expGained);
    console.log(chalk.cyan(`Gained ${expGained} experience!`));
  } else {
    console.log(chalk.red("\nGAME OVER"));
    process.exit();
  }
}

// Enemy data
export const ENEMIES: Record<string, Enemy> = {
  goblin: {
    name: "Goblin",
    hp: 45,
    attack: 12,
    defense: 6,
    exp: 35,
    loot: ["rusty_dagger", "goblin_ear"],
    gold: () => Math.floor(Math.random() * 16) + 10, // Returns 10-25 gold
  },
  goblin_shaman: {
    name: "Goblin Shaman",
    hp: 65,
    attack: 18,
    defense: 7,
    exp: 80,
    loot: ["mana_essence", "bone_charm", "goblin_ear"],
    gold: () => Math.floor(Math.random() * 21) + 30, // Returns 30-50 gold
  },
  skeleton: {
    type: "undead",
    name: "Ancient Skeleton",
    hp: 60,
    attack: 14,
    defense: 8,
    loot: ["bone_fragment", "rusty_sword"],
    gold: () => Math.floor(Math.random() * 21) + 20,
    exp: 50,
  },
  stone_golem: {
    name: "Stone Golem",
    hp: 120,
    attack: 18,
    defense: 15,
    loot: ["stone_core"],
    gold: () => Math.floor(Math.random() * 31) + 40,
    exp: 100,
  },
  void_cultist: {
    name: "Void Cultist",
    hp: 80,
    attack: 20,
    defense: 10,
    loot: ["void_essence", "dark_tome"],
    gold: () => Math.floor(Math.random() * 26) + 30,
    exp: 80,
  },
  wolf: {
    type: "wolf",
    name: "Timber Wolf",
    hp: 40,
    attack: 10,
    defense: 5,
    loot: ["wolf_pelt", "fangs"],
    gold: () => Math.floor(Math.random() * 15) + 10,
    exp: 30,
  },
  forest_spider: {
    type: "spider",
    name: "Forest Spider",
    hp: 25,
    attack: 12,
    defense: 3,
    loot: ["spider_silk", "venom_sac"],
    gold: () => Math.floor(Math.random() * 10) + 5,
    exp: 25,
  },
};

export function createEnemy(type: string): Enemy {
  const enemy = ENEMIES[type];

  if (!enemy) {
    throw new Error(`Unknown enemy type: ${type}`);
  }

  return { ...enemy };
}
