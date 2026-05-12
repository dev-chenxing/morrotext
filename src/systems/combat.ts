import chalk from "chalk";
import inquirer from "inquirer";
import type { Player } from "../actors/Player.ts";
import { generateLoot } from "../world/loot.ts";
import { ACTIONS } from "../actions.ts";
import { CLASSES } from "../classes.ts";
import { COMBAT_BALANCE, CREATURE_TYPE, OBJECT_TYPE } from "../constants.ts";
import { ITEMS, useItem } from "../items.ts";
import type { Area, Creature, NPC, Stats, ValueOf } from "../types.ts";
import { CREATURES, createCreature, type CreatureEntry } from "../world/creatures.ts";

function getActionChoices(
  player: Player,
): Array<{ name: string; value: string }> {
  const choices = [
    { name: "Attack", value: "Attack" },
    { name: "Use Item", value: "Use Item" },
  ];

  const classEntry = CLASSES.find((c) => c.id === player.class.id);
  const classActions = classEntry?.actions ?? [];
  for (const actId of classActions) {
    const act = ACTIONS.find((a) => a.id === actId);
    if (act) choices.push({ name: act.description, value: actId });
  }

  return choices;
}

function calculateDamage(
  attacker: Creature | NPC | Player,
  defender: Creature | NPC | Player,
) {
  // Base damage + 10% random variance
  const baseDamage =
    attacker.stats.attack *
    (COMBAT_BALANCE.ATTACK_VARIANCE_MIN +
      Math.random() * COMBAT_BALANCE.ATTACK_VARIANCE_RANGE);

  // Critical hit chance (5% base + luck factor)
  const critChance =
    COMBAT_BALANCE.CRIT_BASE_CHANCE +
    (attacker.stats.luck || 0) / COMBAT_BALANCE.LUCK_CRIT_DIVISOR;
  const isCrit = Math.random() < critChance;

  const damage = Math.max(
    COMBAT_BALANCE.MIN_DAMAGE,
    Math.floor(
      baseDamage -
        defender.stats.defense *
          (COMBAT_BALANCE.DEFENSE_VARIANCE_MIN +
            Math.random() * COMBAT_BALANCE.DEFENSE_VARIANCE_RANGE),
    ),
  );

  return { damage, isCrit };
}

function formatCombatStatus(entity: { name: string; stats: Stats }) {
  // Ensure HP never shows negative and add space
  const currentHP = Math.max(0, entity.stats.hp);
  return `${entity.name}: ${currentHP} HP`;
}

function updateBattleDisplay(player: Player, enemy: Creature) {
  console.log(chalk.cyan("\n==== BATTLE ===="));
  console.log(chalk.green(formatCombatStatus(player)));
  console.log(chalk.red(formatCombatStatus(enemy)));
  console.log(chalk.cyan("================\n"));
}

function applyDamage(target: { stats: Stats }, damage: number) {
  const newHP = Math.max(0, target.stats.hp - damage);
  const actualDamage = target.stats.hp - newHP;
  target.stats.hp = newHP;
  return actualDamage;
}

export async function startCombat(player: Player, enemy: Creature, area: Area) {
  console.log(chalk.red(`\nA wild ${enemy.name} appears!`));

  updateBattleDisplay(player, enemy);

  while (player.stats.hp > 0 && enemy.stats.hp > 0) {
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
          .filter(([id]) => ITEMS[id].objectType === OBJECT_TYPE.ALCHEMY)
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

      case "divineHeal": {
        {
          const action = ACTIONS.find((a) => a.id === "divineHeal");
          const result = action?.execute(player, enemy);
          if (typeof result === "number" && result > 0) {
            console.log(chalk.cyan(`\n${player.name}: ${player.stats.hp}HP`));
            continue; // healing skips enemy attack
          }
        }
        break;
      }

      case "fireball": {
        {
          const action = ACTIONS.find((a) => a.id === "fireball");
          const fireDmg = action?.execute(player, enemy);
          if (typeof fireDmg === "number" && fireDmg > 0) {
            applyDamage(enemy, fireDmg);
            console.log(chalk.red(`Fireball deals ${fireDmg} damage!`));
          }
        }
        break;
      }
    }

    // Combat status update
    updateBattleDisplay(player, enemy);
  }

  // Victory handling
  if (player.stats.hp > 0) {
    player.recordKill(enemy.type ?? enemy.name);

    const gold = enemy.gold();
    console.log(chalk.green(`Victory! Gained ${gold} gold!`));
    player.gold += gold;

    // Enemy-specific loot drops
    if (enemy.loot) {
      enemy.loot.forEach((itemId) => {
        if (Math.random() < COMBAT_BALANCE.ENEMY_LOOT_DROP_CHANCE) {
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


