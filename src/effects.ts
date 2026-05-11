import chalk from "chalk";
import { GAME_TIMINGS } from "./constants.ts";
import type { Effect } from "./types.ts";

export const EFFECTS: Record<string, Effect> = {
  blessing: {
    id: "blessing",
    name: "Divine Blessing",
    duration: GAME_TIMINGS.BLESSING_DURATION_SECONDS,
    stats: { attack: 5, defense: 5 },
    onApply: () => {
      console.log(
        chalk.yellow("\nHoly light surrounds you! You feel empowered."),
      );
    },
  },
};
