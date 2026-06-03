import chalk from "chalk";
import type { MobilePlayer } from "../types.ts";
import { createPlayer } from "./actors/Player.ts";
import { showActionMenu } from "./ui/menus/MenuAction.ts";
import { showMainMenu } from "./ui/menus/MenuOptions.ts";
import { initializeGameData } from "./initialize.ts";

process.on("uncaughtException", (error: unknown) => {
  if (error instanceof Error && error.name === "ExitPromptError") {
    console.log(chalk.yellow("\nExit"));
    process.exit();
  } else {
    // Rethrow unknown errors
    throw error;
  }
});

// Initialize game
async function startGame() {
  initializeGameData();

  while (true) {
    const action = await showMainMenu();
    if (action === "exit") {
      process.exit();
    }

    const playerReference = createPlayer();
    const mobilePlayer = playerReference.mobile as MobilePlayer;
    mt.player = playerReference;
    mt.mobilePlayer = mobilePlayer;
    mt.worldController.allMobileActors.length = 0;
    mt.worldController.allMobileActors.push(mobilePlayer);

    await mt.runScript({ script: "StartScript" });

    await showActionMenu();
  }
}
void startGame();
