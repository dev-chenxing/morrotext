import inquirer from "inquirer";
import { Player } from "./actors/Player.ts";
import { showMainMenu } from "./ui/menus/MenuOptions.ts";
import { game, getNonDynamicData } from "./gameState.ts";
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

  const classChoices = getNonDynamicData()
    .classes.filter((cls) => cls.playable)
    .map((cls) => ({ name: cls.name, value: cls.id }));

  const { className } = await inquirer.prompt<{ className: string }>({
    type: "list",
    name: "className",
    message: "Choose class:",
    choices: classChoices,
  });

  const player = new Player(name, className);
  game.player = player;

  await showMainMenu(player);
}
void startGame();
