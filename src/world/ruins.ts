import inquirer from "inquirer";
import chalk from "chalk";
import figlet from "figlet";
import { RUINS_BALANCE } from "../constants.ts";
import type { Player } from "../actors/Player.ts";
import { startCombat } from "../systems/combat.ts";
import { createCreatureInstance } from "../world/creatures.ts";
import { ITEMS } from "../world/items.ts";
import { generateLoot } from "./loot.ts";
import { updateQuestProgress } from "./quests.ts";
import type { Area } from "../types.ts";

export async function exploreRuins(player: Player, area: Area) {
  console.log(chalk.yellow(figlet.textSync("ANCIENT RUINS", { font: "Small" })));
  console.log(chalk.gray("You stand before the entrance of a long-forgotten civilization..."));

  const hasDecipheredTablet = !!(player.inventory["deciphered_tablet"] || 0);
  if (hasDecipheredTablet) {
    console.log(chalk.green("\nYour deciphered tablet glows, revealing a hidden path!"));
  }

  let exploring = true;
  while (exploring && player.health.current > 0) {
    // Random encounters
    if (
      exploring &&
      player.health.current > 0 &&
      Math.random() > RUINS_BALANCE.RANDOM_ENCOUNTER_THRESHOLD
    ) {
      const enemies = ["skeleton", "skeleton", "stone_golem", "void_cultist"];
      const enemyType = enemies[Math.floor(Math.random() * enemies.length)];
      await startCombat(player, createCreatureInstance(enemyType), area);
    }

    const hasArtifact = !!(player.inventory["ancient_artifact"] || 0);
    const choices = [];

    if (!hasArtifact) {
      if (hasDecipheredTablet) {
        choices.push("Follow the tablet's map to the artifact chamber");
      }
    }

    choices.push(
      "Explore the central chamber",
      "Search the left passage",
      "Investigate the right passage",
      "Check for hidden rooms",
      "Return to entrance",
    );

    const { action } = await inquirer.prompt({
      type: "list",
      name: "action",
      message: "What will you do?",
      choices,
    });

    switch (action) {
      case "Follow the tablet's map to the artifact chamber":
      case "Search for the artifact":
        await handleArtifactChamber(player);
        break;

      case "Explore the central chamber":
        console.log(chalk.yellow("\nYou find ancient murals depicting forgotten battles."));
        if (Math.random() > RUINS_BALANCE.CENTRAL_CHAMBER_POTION_THRESHOLD) {
          console.log(chalk.green("Found a health potion in a broken urn!"));
          player.inventory["health_potion"] = (player.inventory["health_potion"] || 0) + 1;
        }
        break;

      case "Search the left passage":
        console.log(chalk.cyan("\nYou discover a library of stone tablets..."));
        if (!(player.inventory["ancient_tablet"] || 0)) {
          player.inventory["ancient_tablet"] = (player.inventory["ancient_tablet"] || 0) + 1;
          console.log(
            chalk.green(
              "You carefully extract an intact Ancient Tablet!\nThe Hermit might decipher it.",
            ),
          );
        } else {
          console.log(chalk.gray("The remaining tablets are too damaged to read."));
        }
        break;

      case "Investigate the right passage":
        console.log(chalk.red("\nYou trigger a booby trap!"));
        const trapDamage =
          Math.floor(Math.random() * RUINS_BALANCE.TRAP_DAMAGE_RANGE) +
          RUINS_BALANCE.TRAP_DAMAGE_MIN;
        player.health.current = Math.max(1, player.health.current - trapDamage);
        console.log(`Took ${trapDamage} damage!`);
        break;

      case "Check for hidden rooms":
        const loot = generateLoot("ruins");
        if (Math.random() > RUINS_BALANCE.HIDDEN_ROOM_LOOT_THRESHOLD && loot) {
          console.log(chalk.green("\nYou discover a hidden alcove!"));
          player.inventory[loot] = (player.inventory[loot] || 0) + 1;
          console.log(`Found ${ITEMS[loot].name}!`);
        } else {
          console.log(chalk.gray("\nYou find nothing but dust and cobwebs."));
        }
        break;

      case "Return to entrance":
        console.log(chalk.yellow("\nYou return to the ruins entrance."));
        exploring = false;
        break;
    }
  }
  return { exit: true };
}

async function handleArtifactChamber(player: Player) {
  console.log(
    chalk.yellow("\nYou enter a massive chamber with a glowing artifact on a pedestal..."),
  );

  if (player.activeQuests.some((q) => q.key === "investigate_ruins")) {
    console.log(chalk.green("This must be the artifact the Hermit mentioned!"));

    const { action } = await inquirer.prompt({
      type: "list",
      name: "action",
      message: "What do you do?",
      choices: ["Take the artifact", "Examine it carefully", "Destroy it", "Leave it alone"],
    });

    switch (action) {
      case "Take the artifact":
        player.inventory["crown_of_wisdom"] = (player.inventory["crown_of_wisdom"] || 0) + 1;
        console.log(chalk.yellow("You carefully lift the artifact from its pedestal."));
        player.storyFlags.hasArtifact = true;
        updateQuestProgress(
          player,
          "investigate_ruins",
          1, // Progress to step 1
          "Retrieved the Ancient Artifact! Return it to the Hermit in Darkwood Forest.",
        );
        break;

      case "Examine it carefully":
        if (player.class.id === "cleric" && (player.inventory["holy_symbol"] || 0) > 0) {
          console.log(chalk.cyan("\nYou notice faint inscriptions matching your holy symbol..."));
          console.log(chalk.green("Divine energy flows through you!"));
          player.magicka.base += RUINS_BALANCE.CLERIC_MANA_BONUS;
          player.magicka.current = player.magicka.base;
        } else {
          console.log(
            chalk.cyan("\nYou study the artifact carefully but can't decipher its markings."),
          );
        }
        break;

      case "Destroy it":
        console.log(chalk.red("You smash the artifact with your weapon!"));
        console.log("A wave of dark energy explodes outward...");
        player.health.current = Math.max(
          1,
          player.health.current - RUINS_BALANCE.ARTIFACT_DESTRUCTION_DAMAGE,
        );
        player.storyFlags.artifactDestroyed = true;
        return true;

      default:
        console.log(chalk.gray("You decide to leave it for now."));
        return false;
    }
  }

  console.log(chalk.yellow("A strange energy emanates from the artifact..."));
  return false;
}
