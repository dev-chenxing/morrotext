import chalk from "chalk";
import { getObject } from "../../gameState.ts";
import { GOLD_ID } from "../../../constants.ts";
import type { Player } from "../../../types.ts";

export function showStatsMenu(player: Player) {
  const equippedWeapon = player.equipment.weapon ? getObject(player.equipment.weapon.id) : null;
  const equippedArmor = player.equipment.armor ? getObject(player.equipment.armor.id) : null;
  console.log(chalk.blue("\n=== Character Stats ==="));
  console.log(chalk.blue(`\n=== ${player.name} (Level ${player.level}) ===`));
  console.log(`Class: ${chalk.yellow(player.class.name.toUpperCase())}`);
  console.log(`HP:    ${chalk.green(player.health.current)}/${chalk.green(player.health.base)}`);
  if (player.magicka.base > 0) {
    console.log(`Mana:  ${chalk.blue(player.magicka.current)}/${chalk.blue(player.magicka.base)}`);
  }

  console.log(`\n${chalk.underline("Attributes")}`);
  console.log(`Strength:     ${chalk.red(player.strength.base)}`);
  console.log(`Intelligence: ${chalk.magenta(player.intelligence.base)}`);
  console.log(`Willpower:    ${chalk.hex("#FFA500")(player.willpower.base)}`);
  console.log(`Agility:      ${chalk.cyan(player.agility.base)}`);
  console.log(`Speed:        ${chalk.cyan(player.speed.base)}`);
  console.log(`Endurance:    ${chalk.hex("#FFA500")(player.endurance.base)}`);
  console.log(`Personality:  ${chalk.yellow(player.personality.base)}`);
  console.log(`Luck:         ${chalk.cyan(player.luck.current)}`);

  console.log(`\nEquipment:`);
  console.log(`Weapon: ${equippedWeapon ? equippedWeapon.name : "None"}`);
  console.log(`Armor:  ${equippedArmor ? equippedArmor.name : "None"}`);

  console.log(`\nGold:   ${chalk.yellow(player.inventory.getItemCount(GOLD_ID) || 0)}`);
}
