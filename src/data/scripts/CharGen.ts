import chalk from "chalk";
import type { Script, ScriptRegistryEntry } from "../../core/systems/script.ts";
import { ask } from "../../core/ui/prompt.ts";

const run: Script = async () => {
  console.log(
    chalk.blue("Jiub") + ": " + chalk.white("Stand up... there you go. You were dreaming."),
  );

  const name = await ask({
    actor: "Jiub",
    message: "What's your name?",
    default: mt.player.object.name,
    required: true,
  });
  mt.player.object.name = name;
  mt.mobilePlayer.controlsDisabled = false;
};

const CharGen: ScriptRegistryEntry = { id: "CharGen", run };

export default CharGen;
