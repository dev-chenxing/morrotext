import chalk from "chalk";
import figlet from "figlet";
import type { Cell, Dialogue, MobilePlayer, Reference } from "../types.ts";
import { createPlayer } from "./actors/Player.ts";
import { startCombat } from "./systems/combat.ts";
import { createCreatureInstance } from "./systems/creature.ts";
import { canTalkToActor, talkToNPC } from "./systems/dialogue.ts";
import { useItem } from "./systems/item.ts";
import { createNPCInstance } from "./systems/npc.ts";
import { findQuest, getActiveQuests } from "./systems/quest.ts";
import { resolveDynamic } from "./utils/index.ts";
import { showJournalMenu } from "./ui/menus/MenuJournal.ts";
import { showStatsMenu } from "./ui/menus/MenuStat.ts";
import { initializeGameData } from "./initialize.ts";
import { input, list } from "./ui/prompt.ts";

process.on("uncaughtException", (error: unknown) => {
  if (error instanceof Error && error.name === "ExitPromptError") {
    console.log("❌ Game Exit");
    process.exit();
  } else {
    // Rethrow unknown errors
    throw error;
  }
});

// Display ASCII title
console.log(chalk.gray("The Text-Based RPG"));
console.log(chalk.gray("─".repeat(20)));
console.log(chalk.yellow(figlet.textSync("MORROTEXT")));

// Main menu system
export async function showMainMenu(player: MobilePlayer) {
  const { action } = await list({
    name: "action",
    message: "What would you like to do?",
    choices: ["Travel", "Check Stats", "View Inventory", "View Quests", "Exit Game"],
  });

  switch (action) {
    case "Travel":
      await showTravelMenu(player);
      break;
    case "Check Stats":
      showStatsMenu(player);
      await showMainMenu(player);
      break;
    case "View Inventory":
      await showInventory(player);
      break;
    case "View Quests":
      await showJournalMenu();
      break;
    default:
      process.exit();
  }
}

export async function showInventory(player: MobilePlayer) {
  const inventoryList = Object.entries(player.inventory)
    .map(([id, count]: [string, unknown]) => {
      const item = mt.getObject(id);
      if (!item) {
        return null;
      }
      const isEquipped = player.object.hasItemEquipped(id);
      return {
        name: `${item.name}${isEquipped ? " (Equipped)" : ""} x${String(count)}`,
        value: id,
      };
    })
    .filter((item): item is { name: string; value: string } => Boolean(item));

  if (inventoryList.length === 0) {
    console.log(chalk.red("\nYour inventory is empty!"));
    return showMainMenu(player);
  }

  const { itemId } = await list<{ itemId: string | null }>({
    name: "itemId",
    message: "Inventory:",
    choices: [...inventoryList, { name: "Return to Menu", value: null }],
  });

  if (!itemId) return showMainMenu(player);

  const item = mt.getObject(itemId);
  if (item) {
    const result = await useItem(player, itemId);
    if (result) console.log(chalk.yellow(`\n${result}\n`));
  }

  return showInventory(player);
}

export async function showQuests(player: MobilePlayer) {
  const activeQuests = getActiveQuests();

  if (activeQuests.length === 0) {
    console.log(chalk.yellow("\nNo active quests!"));
    return showMainMenu(player);
  }

  const { questId } = await list<{ questId: string | null }>({
    name: "questId",
    message: "Active Quests:",
    choices: [
      ...activeQuests.map((quest) => ({ name: `${quest.id} [Started]`, value: quest.id })),
      { name: "Return", value: null },
    ],
  });

  if (!questId) return showMainMenu(player);

  const quest = findQuest(undefined, questId);
  if (!quest) {
    return showMainMenu(player);
  }

  console.log(chalk.cyan(`\n=== ${quest.id} ===`));
  console.log(`Status: ${quest.isFinished ? "Completed" : "Started"}`);

  const journalEntries =
    quest.dialogue.length > 0
      ? quest.dialogue.map((d: Dialogue) => {
          if (d.info && d.info.length > 0) return d.info[d.journalIndex ?? 0]?.text ?? d.id;
          return d.id;
        })
      : ["No journal entries yet."];

  journalEntries.forEach((entry, index) => console.log(`${index + 1}. ${entry}`));

  await showQuests(player);
}

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
  const creatureIds = actorIds.filter((id) => Boolean(mt.getObject(id)));
  if (creatureIds.length === 0) return null;
  const selected = creatureIds[Math.floor(Math.random() * creatureIds.length)];
  return createCreatureInstance(selected);
}

export async function enterCell(player: MobilePlayer, cell: Cell) {
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

    const actorIds = actorNodes.map((node) => String((node.object as { id: string }).id));
    const talkableActors = actorNodes.filter((node) => canTalkToActor(node, player));
    const creatureIds = actorIds.filter((id) => Boolean(mt.getObject(id)));

    const choices = [
      ...talkableActors.map((actorRef) => ({
        name: `Talk to ${mt.getObject((actorRef.object as any).id)?.name || mt.getObject((actorRef.object as any).id)?.name || (actorRef.object as any).id}`,
        value: `npc:${(actorRef.object as any).id}`,
      })),
      { name: "Return to Main Menu", value: "return" },
    ];

    if (creatureIds.length > 0) {
      choices.unshift({ name: "Explore area", value: "explore" });
    }

    const { action } = await list<{ action: string }>({
      name: "action",
      message: "What would you like to do?",
      choices,
    });

    if (action.startsWith("npc:")) {
      const npcKey = action.split(":")[1];

      // Try to find the runtime Reference for this actor in the current cell.
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
        // Fallback when cell references aren't populated (unit tests / legacy callers)
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
  return showMainMenu(player);
}

async function showTravelMenu(player: MobilePlayer) {
  const availableCells = mt.dataHandler.nonDynamicData.cells;

  const choices = availableCells.map((loc) => ({
    name: resolveDynamic(loc.displayName, player) ?? loc.editorName,
    value: loc.id,
  }));
  choices.push({ name: "Cancel", value: "__cancel" });

  const { destination } = await list<{ destination: string }>({
    name: "destination",
    message: "Where would you like to travel?",
    choices,
  });

  if (destination === "__cancel") return showMainMenu(player);

  const selectedCell = mt.dataHandler.nonDynamicData.cells.find((loc) => loc.id === destination);
  if (!selectedCell) {
    console.log(chalk.red("Unknown destination selected."));
    return showMainMenu(player);
  }

  console.log(
    chalk.yellow(
      `\nTraveling to ${resolveDynamic(selectedCell.displayName, player) ?? selectedCell.editorName}...`,
    ),
  );
  await enterCell(player, selectedCell);
}

// Initialize game
async function startGame() {
  initializeGameData();

  let name = "";
  while (!name.trim()) {
    const response = await input<{ name: string }>({
      name: "name",
      message: "Enter your name:",
      validate: (input: string) => input.trim() !== "" || "Name cannot be empty!",
    });
    name = response.name.trim();
  }

  const classChoices = mt.dataHandler.nonDynamicData.classes
    .filter((cls) => cls.playable)
    .map((cls) => ({ name: cls.name, value: cls.id }));

  const { className } = await list<{ className: string }>({
    name: "className",
    message: "Choose class:",
    choices: classChoices,
  });

  const playerReference = createPlayer(name, className);
  const mobilePlayer = playerReference.mobile as MobilePlayer;
  mt.player = playerReference;
  mt.mobilePlayer = mobilePlayer;
  mt.worldController.allMobileActors.length = 0;
  mt.worldController.allMobileActors.push(mobilePlayer);

  await showMainMenu(mobilePlayer);
}
void startGame();
