import chalk from "chalk";
import type { Player } from "./actors/Player.ts";
import type { Action } from "./types.ts";

export const ACTIONS: Action[] = [
  {
    id: "fireball",
    name: "Fireball",
    description: "Hurl a fiery projectile (40 mana)",
    manaCost: 40,
    damageMultiplier: 2.5,
    execute(player: Player) {
      const manaCost = this.manaCost ?? 0;
      const damageMultiplier = this.damageMultiplier ?? 0;
      if (player.stats.mana >= manaCost) {
        player.stats.mana -= manaCost;
        return Math.floor(player.stats.magic * damageMultiplier);
      }

      console.log(chalk.red("Not enough mana!"));
      return 0;
    },
  },
  {
    id: "divineHeal",
    name: "Divine Heal",
    description: "Heal wounds with divine light (30 mana)",
    manaCost: 30,
    healMultiplier: 2,
    execute(player: Player) {
      const manaCost = this.manaCost ?? 0;
      const healMultiplier = this.healMultiplier ?? 0;
      if (player.stats.mana >= manaCost) {
        player.stats.mana -= manaCost;
        const healAmount = Math.min(
          player.stats.magic * healMultiplier,
          player.stats.maxHp - player.stats.hp,
        );
        player.stats.hp += healAmount;

        console.log(chalk.yellow(`Divine healing restored ${healAmount} HP!`));
        return healAmount;
      }

      console.log(chalk.red("Not enough mana for healing!"));
      return 0;
    },
  },
];

export default ACTIONS;
