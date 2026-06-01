import chalk from "chalk";
import type { Class, MobilePlayer } from "../types.ts";
import { createPlayer } from "./actors/Player.ts";
import { runScript } from "./systems/script.ts";
import { showChooseClassMenu } from "./ui/menus/MenuChooseClass.ts";
import { showMainMenu } from "./ui/menus/MenuOptions.ts";
import { showServiceTravelMenu } from "./ui/menus/MenuServiceTravel.ts";
import { initializeGameData } from "./initialize.ts";
import { input } from "./ui/prompt.ts";

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

    await runScript("StartScript");

    let name = "";
    while (!name.trim()) {
      const response = await input<{ name: string }>({
        message: "Enter your name:",
        validate: (input: string) => input.trim() !== "" || "Name cannot be empty!",
      });
      name = response.name.trim();
    }

    const classId = await showChooseClassMenu();
    mt.player.object.class = mt.getClass(classId) as Class;

    await showServiceTravelMenu(mobilePlayer);
  }
}
void startGame();
