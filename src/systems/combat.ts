import chalk from "chalk";
import inquirer from "inquirer";
import type { Player } from "../actors/Player.ts";
import { generateLoot } from "../world/loot.ts";
import { ACTIONS } from "../actions.ts";
import { CLASSES } from "../classes.ts";
import { COMBAT_BALANCE, CREATURE_TYPE, OBJECT_TYPE } from "../constants.ts";
import { ITEMS, useItem } from "../items.ts";
import type { Area, Creature, NPC, Stats, ValueOf } from "../types.ts";

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

export type CreatureEntry = {
  type: ValueOf<typeof CREATURE_TYPE>;
  id: string;
  name?: string;
  stats: Partial<Stats>;
  exp: number;
  loot?: string[];
  gold: () => number;
};

// Enemy data
export const CREATURES: CreatureEntry[] = [
  {
    type: CREATURE_TYPE.HUMANOID,
    id: "goblin",
    name: "Goblin",
    stats: { hp: 45, attack: 12, defense: 6 },
    exp: 35,
    loot: ["rusty_dagger", "goblin_ear"],
    gold: () => Math.floor(Math.random() * 16) + 10, // Returns 10-25 gold
  },
  {
    type: CREATURE_TYPE.HUMANOID,
    id: "goblin_shaman",
    name: "Goblin Shaman",
    stats: { hp: 65, attack: 18, defense: 7 },
    exp: 80,
    loot: ["mana_essence", "bone_charm", "goblin_ear"],
    gold: () => Math.floor(Math.random() * 21) + 30, // Returns 30-50 gold
  },
  {
    type: CREATURE_TYPE.UNDEAD,
    id: "skeleton",
    name: "Ancient Skeleton",
    stats: { hp: 60, attack: 14, defense: 8 },
    loot: ["bone_fragment", "rusty_sword"],
    gold: () => Math.floor(Math.random() * 21) + 20,
    exp: 50,
  },
  {
    type: CREATURE_TYPE.NORMAL,
    id: "stone_golem",
    name: "Stone Golem",
    stats: { hp: 120, attack: 18, defense: 15 },
    loot: ["stone_core"],
    gold: () => Math.floor(Math.random() * 31) + 40,
    exp: 100,
  },
  {
    type: CREATURE_TYPE.HUMANOID,
    id: "void_cultist",
    name: "Void Cultist",
    stats: { hp: 80, attack: 20, defense: 10 },
    loot: ["void_essence", "dark_tome"],
    gold: () => Math.floor(Math.random() * 26) + 30,
    exp: 80,
  },
  {
    type: CREATURE_TYPE.NORMAL,
    id: "wolf",
    name: "Timber Wolf",
    stats: { hp: 40, attack: 10, defense: 5 },
    loot: ["wolf_pelt", "fangs"],
    gold: () => Math.floor(Math.random() * 15) + 10,
    exp: 30,
  },
  {
    type: CREATURE_TYPE.NORMAL,
    id: "forest_spider",
    name: "Forest Spider",
    stats: { hp: 25, attack: 12, defense: 3 },
    loot: ["spider_silk", "venom_sac"],
    gold: () => Math.floor(Math.random() * 10) + 5,
    exp: 25,
  },
];

export function createCreature(type: string): Creature {
  const creature = CREATURES.find((e) => e.id === type);

  if (!creature) {
    throw new Error(`Unknown creature type: ${type}`);
  }

  // Build a runtime Creature object with actor defaults
  const runtime: Creature = {
    id: creature.id,
    objectType: OBJECT_TYPE.ACTOR,
    equipment: { weapon: null, armor: null, accessory: null },
    inventory: {},
    hasItemEquipped: (_id: string) => false,
    offersServices: (_service) => false,
    tradesItemType: (_t) => false,

    // Creature-specific fields
    type: creature.type,
    name: creature.name ?? creature.id,
    stats: {
      hp: creature.stats.hp ?? 10,
      maxHp: creature.stats.maxHp ?? creature.stats.hp ?? 10,
      attack: creature.stats.attack ?? 0,
      defense: creature.stats.defense ?? 0,
      magic: creature.stats.magic ?? 0,
      maxMana: creature.stats.maxMana ?? 0,
      mana: creature.stats.mana ?? 0,
      luck: creature.stats.luck ?? 0,
    },
    exp: creature.exp,
    loot: creature.loot,
    gold: creature.gold,
  };

  return runtime;
}
