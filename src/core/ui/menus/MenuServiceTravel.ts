import chalk from "chalk";
import type { Cell, MobilePlayer, Reference } from "../../../types.ts";
import { canTalkToActor, talkToNPC } from "../../systems/dialogue.ts";
import { createNPCInstance } from "../../systems/npc.ts";
import { resolveDynamic } from "../../utils/index.ts";
import { select } from "../prompt.ts";

export async function enterCell(player: MobilePlayer, cell: Cell): Promise<void> {
  const description = resolveDynamic(cell.description, player) ?? "";
  const displayName = resolveDynamic(cell.displayName, player) ?? cell.editorName;
  let inCell = true;
  while (inCell && player.health.current > 0) {
    console.log(chalk.cyan(`\n=== ${displayName} ===`));
    console.log(chalk.hex("#8B4513")(description));
    const actorNodes: Reference[] = [];
    let currentActorNode = cell.actors?.head ?? null;
    while (currentActorNode) {
      actorNodes.push(currentActorNode);
      currentActorNode = currentActorNode.nextNode ?? null;
    }

    const talkableActors = actorNodes.filter((node) => canTalkToActor(node, player));

    const choices = [
      ...talkableActors.map((actorRef) => ({
        name: `Talk to ${mt.getObject((actorRef.object as any).id)?.name || (actorRef.object as any).id}`,
        value: { action: `npc:${(actorRef.object as any).id}` },
      })),
      { name: "Return to Travel Menu", value: { action: "return" } },
    ];

    const { action } = await select<{ action: string }>({
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

      await enterCell(player, cell);
      return;
    }

    inCell = false;
  }
}

export async function showServiceTravelMenu(player: MobilePlayer): Promise<void> {
  while (true) {
    const availableCells = mt.dataHandler.nonDynamicData.cells;

    const choices = availableCells.map((loc) => ({
      name: resolveDynamic(loc.displayName, player) ?? loc.editorName,
      value: { destination: loc.id },
    }));

    const { destination } = await select<{ destination: string | null }>({
      message: "Where would you like to travel?",
      choices: [...choices, { name: "Return to Main Menu", value: { destination: null } }],
    });

    if (destination === null) return;

    const selectedCell = mt.dataHandler.nonDynamicData.cells.find((loc) => loc.id === destination);
    if (!selectedCell) {
      console.log(chalk.red("Unknown destination selected."));
      continue;
    }

    console.log(
      chalk.yellow(
        `\nTraveling to ${resolveDynamic(selectedCell.displayName, player) ?? selectedCell.editorName}...`,
      ),
    );
    await enterCell(player, selectedCell);
  }
}
