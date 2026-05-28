import inquirer from "inquirer";
import { Player } from "./actors/Player.ts";
import { game } from "./gameState.ts";
import { runDataScript } from "./systems/script.ts";
import { showChooseClassMenu } from "./ui/menus/MenuChooseClass.ts";
import { showMainMenu } from "./ui/menus/MenuOptions.ts";
import { showServiceTravelMenu } from "./ui/menus/MenuServiceTravel.ts";
import { initializeGameData } from "./initialize.ts";

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
      const response = await inquirer.prompt<{ name: string }>({
        type: "input",
        name: "name",
        message: "Enter your name:",
        validate: (input: string) => input.trim() !== "" || "Name cannot be empty!",
      });
      name = response.name.trim();
    }

    const classId = await showChooseClassMenu();

    const player = new Player(name, classId);
    game.player = player;

    await runDataScript("StartScript", { player });

    await showServiceTravelMenu(player);
  }
}
void startGame();
