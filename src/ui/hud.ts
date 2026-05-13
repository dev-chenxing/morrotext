import chalk from "chalk";
import { PROGRESSION } from "../constants.ts";
import { getObject } from "../gameState.ts";
import type { Player } from "../types.ts";
import { getNextLevelExp } from "../utils/expLevels.ts";

export function showPlayerStats(player: Player) {
  const equippedWeapon = player.equipment.weapon ? getObject(player.equipment.weapon.id) : null;
  const equippedArmor = player.equipment.armor ? getObject(player.equipment.armor.id) : null;
  console.log(chalk.blue("\n=== Character Stats ==="));
  console.log(chalk.blue(`\n=== ${player.name} (Level ${player.level}) ===`));
  console.log(`Class: ${chalk.yellow(player.class.name.toUpperCase())}`);
  console.log(`HP:    ${chalk.green(player.stats.hp)}/${chalk.green(player.stats.maxHp)}`);
  if (player.stats.maxMana > 0) {
    console.log(`Mana:  ${chalk.blue(player.stats.mana)}/${chalk.blue(player.stats.maxMana)}`);
  }

  console.log(`\n${chalk.underline("Attributes")}`);
  console.log(`Attack:  ${chalk.red(player.stats.attack)}`);
  console.log(`Defense: ${chalk.hex("#FFA500")(player.stats.defense)}`);
  console.log(`Magic:   ${chalk.magenta(player.stats.magic)}`);
  console.log(`Luck:    ${chalk.cyan(player.stats.luck)}`);

  console.log(`\nEquipment:`);
  console.log(`Weapon: ${equippedWeapon ? equippedWeapon.name : "None"}`);
  console.log(`Armor:  ${equippedArmor ? equippedArmor.name : "None"}`);

  console.log(`\nGold:   ${chalk.yellow(player.gold)}`);

  const nextLevelExp = getNextLevelExp(player.level);
  const expDisplay =
    nextLevelExp === PROGRESSION.MAX_LEVEL_LABEL
      ? `${player.exp} (MAX LEVEL)`
      : `${player.exp}/${nextLevelExp}`;

  console.log(`EXP:    ${expDisplay}`);
}
