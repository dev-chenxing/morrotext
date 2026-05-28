import chalk from "chalk";
import { getCell } from "../../core/gameState.ts";
import { enterCell } from "../../core/ui/menus/MenuServiceTravel.ts";
import type { DataScript, DataScriptRegistryEntry } from "../../core/systems/script.ts";

function narrateAzuraIntro(): void {
  const lines = [
    "You have been chosen.",
    "Born on a certain day to uncertain parents.",
    "Beneath the sun and sky, outlander, the Emperor sends you to Morrowind.",
    "First by carriage and now by boat, you have come to the island of Vvardenfell.",
    "I have watched you, and I will watch over the course of your destiny.",
  ];

  console.log("");
  for (const line of lines) {
    console.log(chalk.magenta(line));
  }
  console.log("");
}

const run: DataScript = async ({ player }) => {
  narrateAzuraIntro();

  const prisonShip = getCell("Imperial Prison Ship");
  if (!prisonShip) {
    throw new Error('Missing start cell: "Imperial Prison Ship"');
  }

  await enterCell(player, prisonShip);
};

const StartScript: DataScriptRegistryEntry = { id: "StartScript", run };

export default StartScript;
