import chalk from "chalk";
import type { Action, Player } from "../types.ts";

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
      if (player.magicka.current >= manaCost) {
        player.magicka.current -= manaCost;
        // Temporary mapping: use intelligence as a proxy for magic power
        return Math.floor(player.intelligence.base * damageMultiplier);
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
      if (player.magicka.current >= manaCost) {
        player.magicka.current -= manaCost;
        const healAmount = Math.min(
          player.intelligence.base * healMultiplier,
          player.health.base - player.health.current,
        );
        player.health.current += healAmount;

        console.log(chalk.yellow(`Divine healing restored ${healAmount} HP!`));
        return healAmount;
      }

      console.log(chalk.red("Not enough mana for healing!"));
      return 0;
    },
  },
];

export default ACTIONS;
