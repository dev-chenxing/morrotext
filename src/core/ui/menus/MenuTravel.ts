import inquirer from "inquirer";
import chalk from "chalk";
import type { Cell, Reference } from "../../../types.ts";
import { Player } from "../../actors/Player.ts";
import { startCombat } from "../../systems/combat.ts";
import { createCreatureInstance } from "../../systems/creature.ts";
import { talkToNPC } from "../../systems/dialogue.ts";
import { createNPCInstance } from "../../systems/npc.ts";
import { exploreRuins } from "../../../data/cells/ruins.ts";
import { resolveDynamic } from "../../utils/dynamicUtils.ts";
import {
  getDialogue,
  getNPC,
  getNonDynamicData,
  getCreature,
} from "../../gameState.ts";

function collectActorIdsFromCell(cell: Cell): string[] {
  const ids: string[] = [];
  const list = cell.actors;
  if (!list || !list.head) return ids;
  let node: Reference | null | undefined = list.head;
  while (node) {
    const obj: any = (node.object as any) ?? null;
    if (obj && typeof obj.id === "string") ids.push(obj.id);
    node = node.nextNode ?? null;
  }
  return ids;
}

function getRandomCreatureFromCell(cell: Cell) {
  const actorIds = collectActorIdsFromCell(cell);
  const creatureIds = actorIds.filter((id) => Boolean(getCreature(id)));
  if (creatureIds.length === 0) return null;
  const selected = creatureIds[Math.floor(Math.random() * creatureIds.length)];
  return createCreatureInstance(selected);
}

export async function enterCell(player: Player, cell: Cell): Promise<void> {
  const description = resolveDynamic(cell.description, player) ?? "";
  const displayName = resolveDynamic(cell.displayName, player) ?? cell.editorName;
  if (displayName === "Ancient Ruins") {
    const creature = getRandomCreatureFromCell(cell);
    if (creature) await startCombat(player, creature);
    await exploreRuins(player);
  } else {
    let inCell = true;
    while (inCell && player.health.current > 0) {
      console.log(chalk.cyan(`\n=== ${displayName} ===`));
      console.log(chalk.hex("#8B4513")(description));
      const actorIds = collectActorIdsFromCell(cell);
      const npcIds = actorIds.filter((id) => Boolean(getDialogue(id)));
      const creatureIds = actorIds.filter((id) => Boolean(getCreature(id)));

      const choices = [
        ...npcIds.map((npcKey: string) => ({
          name: `Talk to ${getNPC(npcKey)?.name || npcKey}`,
          value: `npc:${npcKey}`,
        })),
        { name: "Return to Main Menu", value: "return" },
      ];

      if (creatureIds.length > 0) {
        choices.unshift({ name: "Explore area", value: "explore" });
      }

      const { action } = await inquirer.prompt({
        type: "list",
        name: "action",
        message: "What would you like to do?",
        choices,
      });

      if (action.startsWith("npc:")) {
        const npcKey = action.split(":")[1];

        let node = cell.actors?.head ?? null;
        let foundRef: Reference | undefined;
        while (node) {
          const obj: any = node.object as any;
          if (obj && typeof obj.id === "string" && obj.id === npcKey) {
            foundRef = node;
            break;
          }
          node = node.nextNode ?? null;
        }

        if (foundRef) {
          await talkToNPC(foundRef, player);
        } else {
          await talkToNPC(createNPCInstance(npcKey), player);
        }

        return enterCell(player, cell);
      } else if (action === "explore") {
        const creature = getRandomCreatureFromCell(cell);
        if (creature) await startCombat(player, creature);
      } else {
        inCell = false;
      }
    }
  }
}

export async function showTravelMenu(player: Player): Promise<void> {
  const availableCells = getNonDynamicData().cells;

  const choices = availableCells.map((loc) => ({
    name: resolveDynamic(loc.displayName, player) ?? loc.editorName,
    value: loc.id,
  }));
  choices.push({ name: "Cancel", value: "__cancel" });

  const { destination } = await inquirer.prompt<{ destination: string }>({
    type: "list",
    name: "destination",
    message: "Where would you like to travel?",
    choices,
  });

  if (destination === "__cancel") return;

  const selectedCell = getNonDynamicData().cells.find((loc) => loc.id === destination);
  if (!selectedCell) {
    console.log(chalk.red("Unknown destination selected."));
    return;
  }

  console.log(
    chalk.yellow(
      `\nTraveling to ${resolveDynamic(selectedCell.displayName, player) ?? selectedCell.editorName}...`,
    ),
  );
  await enterCell(player, selectedCell);
}
