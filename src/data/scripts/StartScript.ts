import chalk from "chalk";
import type { Script, ScriptRegistryEntry } from "../../core/systems/script.ts";
import { pressToContinue } from "../../core/ui/prompt.ts";

async function intro(): Promise<void> {
  const azuraLines = [
    "They have taken you from the Imperial City's prison, ",
    "first by carriage and now by boat, ",
    "to the east, ",
    "to Morrowind. ",
    "Fear not, for I am watchful. ",
    "You have been chosen. ",
  ];

  for (const line of azuraLines) {
    console.log(chalk.red(line));
  }

  await pressToContinue();

  const jiubLines = [
    '"Wake up, we\'re here."',
    '"Why are you shaking?"',
    '"Are you ok?"',
    '"Wake up."',
  ];

  for (const line of jiubLines) {
    console.log(chalk.blue(line));
  }

  await pressToContinue();
}

const run: Script = async () => {
  await intro();

  await mt.positionCell({ cell: "Imperial Prison Ship" });
};

const StartScript: ScriptRegistryEntry = { id: "StartScript", run };

export default StartScript;
