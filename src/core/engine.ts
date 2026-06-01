import type { MobilePlayer } from "../types.ts";
import { createPlayer } from "./actors/Player.ts";
import { runDataScript } from "./systems/script.ts";
import { showChooseClassMenu } from "./ui/menus/MenuChooseClass.ts";
import { showMainMenu } from "./ui/menus/MenuOptions.ts";
import { showServiceTravelMenu } from "./ui/menus/MenuServiceTravel.ts";
import { initializeGameData } from "./initialize.ts";
import { input } from "./ui/prompt.ts";

process.on("uncaughtException", (error: unknown) => {
  if (error instanceof Error && error.name === "ExitPromptError") {
    console.log("❌ Game Exit");
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

    let name = "";
    while (!name.trim()) {
      const response = await input<{ name: string }>({
        name: "name",
        message: "Enter your name:",
        validate: (input: string) => input.trim() !== "" || "Name cannot be empty!",
      });
      name = response.name.trim();
    }

    const classId = await showChooseClassMenu();

    const playerReference = createPlayer(name, classId);
    const mobilePlayer = playerReference.mobile as MobilePlayer;
    mt.player = playerReference;
    mt.mobilePlayer = mobilePlayer;
    mt.worldController.allMobileActors.length = 0;
    mt.worldController.allMobileActors.push(mobilePlayer);

    await runDataScript("StartScript", { player: mobilePlayer });

    await showServiceTravelMenu(mobilePlayer);
  }
}
void startGame();
