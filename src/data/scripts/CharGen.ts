import chalk from "chalk";
import type { Reference } from "../../types.ts";
import type { Script, ScriptRegistryEntry } from "../../core/systems/script.ts";
import { input } from "../../core/ui/prompt.ts";

async function intro(reference?: Reference): Promise<void> {
  if (reference) {
    reference.tempData.__chargen = true;
  }

  console.log(
    chalk.blue("Jiub") + ": " + chalk.white("Stand up... there you go. You were dreaming."),
  );

  const name = await input({ message: chalk.white("What's your name?") });
  mt.player.object.name = name;
}

const run: Script = async (reference?: Reference) => {
  await intro(reference);
};

const CharGen: ScriptRegistryEntry = { id: "CharGen", run };

export default CharGen;
