import chalk from "chalk";
import { getNextLevelExp } from "../utils/expLevels.ts";
import { ITEMS } from "../items.ts";
import type { Player } from "../types.ts";

export function showPlayerStats(player: Player) {
  console.log(chalk.blue("\n=== Character Stats ==="));
  console.log(chalk.blue(`\n=== ${player.name} (Level ${player.level}) ===`));
  console.log(`Class: ${chalk.yellow(player.class.toUpperCase())}`);
  console.log(`HP:    ${chalk.green(player.hp)}/${chalk.green(player.maxHp)}`);
  if (player.maxMana > 0) {
    console.log(
      `Mana:  ${chalk.blue(player.mana)}/${chalk.blue(player.maxMana)}`,
    );
  }

  console.log(`\n${chalk.underline("Attributes")}`);
  console.log(`Attack:  ${chalk.red(player.attack)}`);
  console.log(`Defense: ${chalk.hex("#FFA500")(player.defense)}`);
  console.log(`Magic:   ${chalk.magenta(player.magic || 0)}`);
  console.log(`Luck:    ${chalk.cyan(player.luck)}`);

  console.log(`\nEquipment:`);
  console.log(
    `Weapon: ${player.equipment.weapon ? ITEMS[player.equipment.weapon.id].name : "None"}`,
  );
  console.log(
    `Armor:  ${player.equipment.armor ? ITEMS[player.equipment.armor.id].name : "None"}`,
  );

  console.log(`\nGold:   ${chalk.yellow(player.gold)}`);

  const nextLevelExp = getNextLevelExp(player.level);
  const expDisplay =
    nextLevelExp === "MAX"
      ? `${player.exp} (MAX LEVEL)`
      : `${player.exp}/${nextLevelExp}`;

  console.log(`EXP:    ${expDisplay}`);
}
