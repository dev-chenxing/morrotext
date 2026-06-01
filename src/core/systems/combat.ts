import chalk from "chalk";
import { COMBAT_BALANCE, OBJECT_TYPE, GOLD_ID } from "../../constants.ts";
import type { Creature, MobilePlayer } from "../../types.ts";
import { useItem } from "./item.ts";
import { select } from "../ui/prompt.ts";

function getActionChoices(player: MobilePlayer): Array<{ name: string; value: { action: string } }> {
  const choices = [
    { name: "Attack", value: { action: "Attack" } },
    { name: "Use Item", value: { action: "Use Item" } },
  ];

  for (const action of player.object.class.actions) {
    choices.push({ name: action.description, value: { action: action.id } });
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
  const name = entity.object?.name ?? entity.name ?? entity.id ?? "Unknown";
  return `${name}: ${currentHP} HP`;
}

function updateBattleDisplay(player: MobilePlayer, enemy: Creature) {
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

function transferCreatureLootToPlayer(player: MobilePlayer, enemy: Creature) {
  let totalGold = 0;

  enemy.inventory.items.forEach((stack) => {
    if (stack.count <= 0) return;

    if (stack.object.id === GOLD_ID) {
      totalGold += stack.count;
      return;
    }

    player.inventory.addItem(stack.object.id, stack.count);

    const quantityLabel = stack.count > 1 ? ` x${stack.count}` : "";
    console.log(chalk.blue(`Found ${stack.object.name}${quantityLabel}!`));
  });

  if (totalGold > 0) {
    player.inventory.addItem(GOLD_ID, totalGold);
    console.log(chalk.green(`Victory! Gained ${totalGold} gold!`));
  }
}

export async function startCombat(player: MobilePlayer, enemy: Creature) {
  console.log(chalk.red(`\nA wild ${enemy.name} appears!`));

  updateBattleDisplay(player, enemy);

  while ((player.health?.current ?? 0) > 0 && (enemy.health?.current ?? 0) > 0) {
    const { action } = await select<{ action: string }>({
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
        const inventoryList = player.inventory.items
          .filter(
            (stack) =>
              stack.count > 0 && mt.getObject(stack.object.id)?.objectType === OBJECT_TYPE.ALCHEMY,
          )
          .map((stack) => {
            const item = mt.getObject(stack.object.id);
            if (!item) return null;
            return { name: `${item.name} x${stack.count}`, value: { itemId: stack.object.id } } as {
              name: string;
              value: { itemId: string };
            } | null;
          })
          .filter((item): item is { name: string; value: { itemId: string } } => Boolean(item));
        const { itemId } = await select<{ itemId: string | null }>({
          message: "Select item:",
          choices: [...inventoryList, { name: "Cancel", value: { itemId: null } }],
        });

        if (itemId) {
          const result = await useItem(player, itemId);
          if (result) console.log(chalk.yellow(result));
        }
        break;

      default: {
        const classAction = player.object.class.actions.find((a) => a.id === action);
        const result = classAction?.execute(player, enemy);

        if (typeof result === "number" && result > 0) {
          if (classAction?.id === "divineHeal") {
            console.log(chalk.cyan(`\n${player.object.name}: ${player.health.current}HP`));
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
    console.log(chalk.green("Victory!"));
    transferCreatureLootToPlayer(player, enemy);
  } else {
    console.log(chalk.red("\nGAME OVER"));
    process.exit();
  }
}
