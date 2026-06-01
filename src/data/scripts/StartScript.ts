import chalk from "chalk";
import { enterCell } from "../../core/ui/menus/MenuServiceTravel.ts";
import type { Script, ScriptRegistryEntry } from "../../core/systems/script.ts";
import type { Cell } from "../../types.ts";
import { pressToContinue } from "../../core/ui/prompt.ts";

function intro(): void {
  const lines = [
    "They have taken you from the Imperial City's prison, ",
    "first by carriage and now by boat, ",
    "to the east, ",
    "to Morrowind. ",
    "Fear not, for I am watchful. ",
    "You have been chosen. ",
  ];

  for (const line of lines) {
    console.log(chalk.red(line));
  }
}

const run: Script = async () => {
  intro();
  await pressToContinue();

  const prisonShip = mt.getCell("Imperial Prison Ship") as Cell;
  await enterCell(mt.mobilePlayer, prisonShip);
};

const StartScript: ScriptRegistryEntry = { id: "StartScript", run };

export default StartScript;
