import chalk from "chalk";
import inquirer from "inquirer";
import { getObject } from "../gameState.ts";
import type { Player } from "../actors/Player.ts";
import { generateLoot } from "../world/loot.ts";
import { COMBAT_BALANCE, OBJECT_TYPE } from "../constants.ts";
import { useItem } from "./item.ts";
import type { Area, Creature, NPC } from "../types.ts";

function getActionChoices(player: Player): Array<{ name: string; value: string }> {
  const choices = [
    { name: "Attack", value: "Attack" },
    { name: "Use Item", value: "Use Item" },
  ];

  for (const action of player.class.actions) {
    choices.push({ name: action.description, value: action.id });
  }

  return choices;
}

function calculateDamage(attacker: any, defender: any) {
  // Derive basic attack/defense from attributes for now
  const attackRating = attacker.strength?.base ?? attacker.intelligence?.base ?? 0;
  const defenseRating = defender.endurance?.base ?? defender.agility?.base ?? 0;

  // Base damage + variance
  const baseDamage =
    attackRating *
    (COMBAT_BALANCE.ATTACK_VARIANCE_MIN + Math.random() * COMBAT_BALANCE.ATTACK_VARIANCE_RANGE);

  const critChance =
    COMBAT_BALANCE.CRIT_BASE_CHANCE +
    (attacker.luck?.current ?? 0) / COMBAT_BALANCE.LUCK_CRIT_DIVISOR;
  const isCrit = Math.random() < critChance;

  const damage = Math.max(
    COMBAT_BALANCE.MIN_DAMAGE,
    Math.floor(
      baseDamage -
        defenseRating *
          (COMBAT_BALANCE.DEFENSE_VARIANCE_MIN +
            Math.random() * COMBAT_BALANCE.DEFENSE_VARIANCE_RANGE),
    ),
  );

  return { damage, isCrit };
}

function formatCombatStatus(entity: any) {
  const currentHP = Math.max(0, entity.health?.current ?? 0);
  return `${entity.name}: ${currentHP} HP`;
}

function updateBattleDisplay(player: Player, enemy: Creature) {
  console.log(chalk.cyan("\n==== BATTLE ===="));
  console.log(chalk.green(formatCombatStatus(player)));
  console.log(chalk.red(formatCombatStatus(enemy)));
  console.log(chalk.cyan("================\n"));
}

function applyDamage(target: any, damage: number) {
  const newHP = Math.max(0, (target.health?.current ?? 0) - damage);
  const actualDamage = (target.health?.current ?? 0) - newHP;
  if (target.health) target.health.current = newHP;
  return actualDamage;
}

export async function startCombat(player: Player, enemy: Creature, area: Area) {
  console.log(chalk.red(`\nA wild ${enemy.name} appears!`));

  updateBattleDisplay(player, enemy);

  while ((player.health?.current ?? 0) > 0 && (enemy.health?.current ?? 0) > 0) {
    const { action } = await inquirer.prompt({
      type: "list",
      name: "action",
      message: "Choose your action:",
      choices: getActionChoices(player),
    });

    switch (action) {
      case "Attack":
        const { damage: playerDmg, isCrit: playerCrit } = calculateDamage(player, enemy);
        applyDamage(enemy, playerDmg);
        console.log(
          chalk.red(`You deal ${playerDmg} damage${playerCrit ? " CRITICAL HIT!" : ""}!`),
        );

        // Enemy counterattack
        const { damage: enemyDmg, isCrit: enemyCrit } = calculateDamage(enemy, player);
        applyDamage(player, enemyDmg);
        console.log(
          chalk.yellow(
            `${enemy.name} deals ${enemyDmg} damage${enemyCrit ? " CRITICAL HIT!" : ""}!`,
          ),
        );
        break;

      case "Use Item":
        const inventoryList = Object.entries(player.inventory)
          .filter(([id]) => getObject(id)?.objectType === OBJECT_TYPE.ALCHEMY)
          .map(([id, count]) => {
            const item = getObject(id);
            if (!item) {
              return null;
            }
            return {
              name: `${item.name} x${count}`,
              value: id,
            };
          })
          .filter((item): item is { name: string; value: string } => Boolean(item));
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

      default: {
        const classAction = player.class.actions.find((a) => a.id === action);
        const result = classAction?.execute(player, enemy);

        if (typeof result === "number" && result > 0) {
          if (classAction?.id === "divineHeal") {
            console.log(chalk.cyan(`\n${player.name}: ${player.health.current}HP`));
            continue;
          }

          if (classAction?.id === "fireball") {
            applyDamage(enemy, result);
            console.log(chalk.red(`${classAction.name} deals ${result} damage!`));
          }
        }
        break;
      }
    }

    // Combat status update
    updateBattleDisplay(player, enemy);
  }

  // Victory handling
  if ((player.health?.current ?? 0) > 0) {
    player.recordKill(enemy.type ?? enemy.name);

    const gold = enemy.gold();
    console.log(chalk.green(`Victory! Gained ${gold} gold!`));
    player.gold += gold;

    // Enemy-specific loot drops
    if (enemy.loot) {
      enemy.loot.forEach((itemId) => {
        if (Math.random() < COMBAT_BALANCE.ENEMY_LOOT_DROP_CHANCE) {
          const item = getObject(itemId);
          if (!item) return;
          player.addItem(itemId);
          console.log(chalk.blue(`Found ${item.name}!`));
        }
      });
    }

    // Procedural loot generation
    const lootId = area.lootTable ? generateLoot(area.lootTable) : null;
    if (lootId) {
      const proceduralItem = getObject(lootId);
      if (!proceduralItem) {
        throw new Error(`Unknown loot item: ${lootId}`);
      }
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
