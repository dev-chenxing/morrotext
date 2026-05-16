import inquirer from "inquirer";
import chalk from "chalk";
import type { Player } from "../actors/Player.ts";
import { GOLD_ID } from "../constants.ts";
import { getDialogue } from "../gameState.ts";
import { completeQuest, QUESTS } from "../world/quests.ts";
import { resolveDynamic } from "../utils/dynamicUtils.ts";
import { barter } from "./barter.ts";
import type { DialogueActionResult, DialogueOption, NPC } from "../types.ts";

async function handleDialogueAction(
  player: Player,
  actor: NPC,
  action: string,
  data: DialogueOption,
): Promise<DialogueActionResult> {
  const entry = getDialogue(actor.id);
  switch (action) {
    case "open_shop":
      await barter(player, actor);
      return { exit: false };

    case "rest":
      if (typeof data.cost === "number" && player.inventory.getItemCount(GOLD_ID) >= data.cost) {
        player.inventory.removeItem(GOLD_ID, data.cost);
        player.health.current = player.health.base;
        player.magicka.current = player.magicka.base;
        return {
          message: chalk.green("You rest fully and recover all HP and mana!"),
          exit: true,
        };
      }
      return {
        message: chalk.red("Not enough gold for a room!"),
        exit: false,
      };

    case "rumor":
    case "artifact_info":
    case "guidance":
    case "cultists_info":
    case "hermit_area":
    case "relic_details":
    case "more_rumors":
    case "show_tablet":
    case "translate_tablet":
    case "return_artifact":
    case "special_orders":
    case "material_details":
    case "complete_special_orders":
      // These are handled through dialogue state transitions

      let message = "I've nothing more to say.";
      if (entry?.dialogues?.[action]) {
        message = resolveDynamic(entry.dialogues[action].question, player) ?? message;
      }

      return {
        nextState: action,
        message: message,
      };

    case "complete_tablet":
      player.inventory.removeItem("ancient_tablet", 1);
      player.inventory.addItem("deciphered_tablet", 1);
      return {
        message: chalk.green(
          "The Hermit deciphered the tablet! He marked a map to the artifact chamber.",
        ),
        exit: true,
      };

    case "start_quest":
      if (data.quest && !player.activeQuests.some((q) => q.key === data.quest)) {
        const quest = QUESTS[data.quest];

        if (!quest) {
          return {
            message: "That quest is unavailable right now.",
            exit: false,
          };
        }

        player.activeQuests.push({
          key: data.quest,
          ...quest,
          progress: 0,
        });
        return {
          message: `Quest started: "${quest.title}"`,
          exit: true,
        };
      }
      return {
        message: "Quest already active!",
        exit: false,
      };

    case "complete_quest":
      if (data.quest === "investigate_ruins") {
        // Verify requirements
        if (!player.inventory.getItemCount("crown_of_wisdom")) {
          return {
            message: "You don't have the required item!",
            exit: true,
          };
        }
        // Story progression
        player.inventory.removeItem("crown_of_wisdom", 1);
        player.storyFlags.artifactSecured = true;
        console.log(chalk.yellow("\nThe Hermit places the artifact in the town vault."));
        completeQuest(player, "investigate_ruins");
        return {
          exit: true,
        };
      } else if (data.quest === "slay_goblins") {
        console.log("You've done us a great service! Here's your reward.");
        console.log(chalk.green("\nThe forest is now safe from goblin raids!"));
        completeQuest(player, data.quest);
        return {
          exit: true,
        };
      } else if (data.quest === "special_orders") {
        // Remove quest items
        player.inventory.removeItem("void_essence", 5);

        // Complete quest
        completeQuest(player, "special_orders");
        return {
          exit: true,
        };
      }

    case "blessing":
      if (typeof data.cost === "number" && player.inventory.getItemCount(GOLD_ID) >= data.cost) {
        player.inventory.removeItem(GOLD_ID, data.cost);
        // Apply immediate small heal/restore as a replacement for runtime blessing effects
        player.health.current = Math.min(player.health.base, player.health.current + 10);
        player.magicka.current = Math.min(player.magicka.base, player.magicka.current + 10);
        return { exit: true };
      }
      return { message: chalk.red("Not enough gold for blessing!"), exit: false };

    case "prayer":
      player.magicka.current = player.magicka.base;
      return { message: chalk.blue("Divine energy renews your spirit!"), exit: true };

    case "leave":
      return { message: "Come back anytime!", exit: true };

    default:
      return {
        message: "Safe travels, adventurer!",
        exit: true,
      };
  }
}

export async function talkToNPC(actor: NPC, player: Player) {
  const entry = getDialogue(actor.id);

  if (!entry) {
    console.log(chalk.red(`NPC ${actor.id} not found!`));
    return;
  }
  let currentState = "initial";

  console.log(chalk.cyan(`\n=== ${entry.name} ===`));

  while (true) {
    const state = entry.dialogues[currentState];
    if (!state) break;
    const choices = state.options
      .filter((option) => {
        return !option.condition || option.condition(player);
      })
      .map((opt) => ({
        name: opt.text,
        value: { action: opt.action, data: opt },
      }));

    // Resolve dynamic question
    const question = resolveDynamic(state.question, player) ?? "";

    const { choice } = await inquirer.prompt({
      type: "list",
      name: "choice",
      message: question,
      choices,
    });

    const result = await handleDialogueAction(player, actor, choice.action, choice.data);

    if (result.nextState) {
      currentState = result.nextState;
    } else if (result.message) {
      console.log(chalk.yellow(`\n${result.message}`));
    }

    if (result.effect) {
      result.effect(); // Execute the effect callback
    }

    if (result.exit) {
      break;
    }
  }
}

export function getNPCName(npcKey: string) {
  const dialogue = getDialogue(npcKey);
  if (!dialogue) {
    throw new Error(`Missing NPC data for: ${npcKey}`);
  }
  return dialogue.name;
}
