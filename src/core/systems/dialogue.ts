import inquirer from "inquirer";
import chalk from "chalk";
import { GOLD_ID } from "../../constants.ts";
import type { DialogueInfo, NPC, Player, Reference } from "../../types.ts";
import { resolveDynamic } from "../utils/dynamicUtils.ts";
import { getDialogue, getNPC } from "../gameState.ts";
import { barter } from "./barter.ts";
import { completeQuest, startQuest } from "./quest.ts";

async function handleDialogueAction(
  player: Player,
  actor: NPC,
  action: string,
  data: DialogueInfo,
): Promise<any> {
  const entry = getDialogue(actor.id);
  switch (action) {
    case "open_shop":
      await barter(player, actor);
      return { exit: false };

    case "rest": {
      const cost = (data as any).cost;
      if (
        typeof cost === "number" &&
        player.inventory.getItemCount(GOLD_ID) >= cost
      ) {
        player.inventory.removeItem(GOLD_ID, cost);
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
    }

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
      // Try to find a flattened info entry that represents the target state
      const target = entry?.info?.find((i: any) => i._state === action);
      if (target) {
        message = resolveDynamic((target as any).prompt, player) ?? message;
      }

      return {
        nextState: action,
        message,
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

    case "start_quest": {
      const questId = (data as any).quest;
      if (questId) {
        const quest = startQuest(questId);
        if (quest) {
          return {
            message: `Quest started: "${questId}"`,
            exit: true,
          };
        }

        return {
          message: "That quest is unavailable right now.",
          exit: false,
        };
      }
      return {
        message: "That quest is unavailable right now.",
        exit: false,
      };
    }

    case "complete_quest": {
      const questId = (data as any).quest;
      if (questId === "investigate_ruins") {
        // Verify requirements
        if (!player.inventory.getItemCount("crown_of_wisdom")) {
          return {
            message: "You don't have the required item!",
            exit: true,
          };
        }
        // Story progression
        player.inventory.removeItem("crown_of_wisdom", 1);
        console.log(
          chalk.yellow("\nThe Hermit places the artifact in the town vault."),
        );
        completeQuest("investigate_ruins");
        return {
          exit: true,
        };
      } else if (questId === "slay_goblins") {
        console.log("You've done us a great service! Here's your reward.");
        console.log(chalk.green("\nThe forest is now safe from goblin raids!"));
        completeQuest(questId);
        return {
          exit: true,
        };
      } else if (questId === "special_orders") {
        // Remove quest items
        player.inventory.removeItem("void_essence", 5);

        // Complete quest
        completeQuest("special_orders");
        return {
          exit: true,
        };
      }
    }

    case "blessing": {
      const cost = (data as any).cost;
      if (
        typeof cost === "number" &&
        player.inventory.getItemCount(GOLD_ID) >= cost
      ) {
        player.inventory.removeItem(GOLD_ID, cost);
        // Apply immediate small heal/restore as a replacement for runtime blessing effects
        player.health.current = Math.min(
          player.health.base,
          player.health.current + 10,
        );
        player.magicka.current = Math.min(
          player.magicka.base,
          player.magicka.current + 10,
        );
        return { exit: true };
      }
      return {
        message: chalk.red("Not enough gold for blessing!"),
        exit: false,
      };
    }

    case "prayer":
      player.magicka.current = player.magicka.base;
      return {
        message: chalk.blue("Divine energy renews your spirit!"),
        exit: true,
      };

    case "leave":
      return { message: "Come back anytime!", exit: true };

    default:
      return {
        message: "Safe travels, adventurer!",
        exit: true,
      };
  }
}

export async function talkToNPC(actorOrRef: NPC | Reference, player: Player) {
  let reference: Reference;
  let actor: NPC;

  if ((actorOrRef as Reference).object !== undefined) {
    reference = actorOrRef as Reference;
    actor = reference.object as NPC;
  } else {
    actor = actorOrRef as NPC;
    reference = {
      id: `${actor.id}-temp-ref`,
      objectType: actor.objectType as any,
      data: {},
      tempData: {},
      object: actor,
      cell: null,
    } as Reference;
  }

  const entry = getDialogue(actor.id);

  if (!entry) {
    console.log(chalk.red(`NPC ${actor.id} not found!`));
    return;
  }

  console.log(chalk.cyan(`\n=== ${actor.name} ===`));

  // Flattened `info` entries: present a single menu composed of all options.
  if (!entry.info || entry.info.length === 0) {
    console.log(chalk.yellow("This NPC has nothing to say."));
    return;
  }

  while (true) {
    const question = `${actor.name} says:`;

    const choices = entry.info
      .filter((option: any) => {
        const cond = (option as any).condition;
        return !cond || cond(player);
      })
      .map((opt: DialogueInfo) => ({ name: opt.text, value: opt }));

    const { choice } = await inquirer.prompt<{ choice: DialogueInfo }>({
      type: "list",
      name: "choice",
      message: question,
      choices,
    });

    // Execute script or legacy action. Scripts perform side-effects internally
    // and may optionally return a legacy-style result object which we will
    // inspect for compatibility.
    let result: any;
    if (choice.runScript) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const maybe = await Promise.resolve(choice.runScript(reference) as any);
      result = maybe as any;
    } else if ((choice as any).action) {
      // legacy fallback
      result = await handleDialogueAction(
        player,
        actor,
        (choice as any).action,
        choice,
      );
    } else {
      result = { exit: true };
    }

    if (result) {
      if (result.message) console.log(chalk.yellow(`\n${result.message}`));
      if (result.effect) result.effect();
    }

    // Honor scripts that signal exit via the reference's tempData.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((reference.tempData as any)?.__dialogue_exit) {
      // Clear the flag and exit the dialogue loop
      delete (reference.tempData as any).__dialogue_exit;
      break;
    }

    if (result && result.exit) break;
  }
}

export function getNPCName(npcKey: string) {
  const npc = getNPC(npcKey);
  if (npc && npc.name) return npc.name;
  return npcKey;
}
