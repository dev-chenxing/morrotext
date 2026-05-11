import chalk from "chalk";
import type { Effect } from "./types.ts";

export const EFFECTS: Record<string, Effect> = {
  blessing: {
    id: "blessing",
    name: "Divine Blessing",
    type: "buff",
    duration: 60, // 1 minute in seconds
    stats: { attack: 5, defense: 5 },
    onApply: () => {
      console.log(
        chalk.yellow("\nHoly light surrounds you! You feel empowered."),
      );
    },
  },
};
