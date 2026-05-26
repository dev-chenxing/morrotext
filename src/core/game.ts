import inquirer from "inquirer";
import chalk from "chalk";
import figlet from "figlet";
import { Player } from "./actors/Player.ts";
import { startCombat } from "./systems/combat.ts";
import { talkToNPC } from "./systems/dialogue.ts";
import { useItem } from "./systems/item.ts";
import {
  game,
  getDialogue,
  getNPC,
  getNonDynamicData,
  getObject,
  getCreature,
} from "./gameState.ts";
import { initializeGameData } from "./initialize.ts";
import { createCreatureInstance } from "../data/creatures.ts";
import { exploreRuins } from "../data/cells/ruins.ts";
import { createNPCInstance } from "../data/npcs.ts";
import { findQuest, getActiveQuests } from "../data/quests.ts";
import { resolveDynamic } from "./utils/dynamicUtils.ts";
import { MenuStat } from "./ui/menus/MenuStat.ts";
import type { Cell, Reference } from "../types.ts";

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
export async function showMainMenu(player: Player) {
  const { action } = await inquirer.prompt({
    type: "list",
    name: "action",
    message: "What would you like to do?",
    choices: [
      "Travel",
      "Check Stats",
      "View Inventory",
      "View Quests",
      "Exit Game",
    ],
  });

  switch (action) {
    case "Travel":
      await showTravelMenu(player);
      break;
    case "Check Stats":
      MenuStat(player);
      await showMainMenu(player);
      break;
    case "View Inventory":
      await showInventory(player);
      break;
    case "View Quests":
      await showQuests(player);
      break;
    default:
      process.exit();
  }
}

export async function showInventory(player: Player) {
  const inventoryList = Object.entries(player.inventory)
    .map(([id, count]: [string, unknown]) => {
      const item = getObject(id);
      if (!item) {
        return null;
      }
      const isEquipped = player.isItemEquipped(id);
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

  const { itemId } = await inquirer.prompt<{ itemId: string | null }>({
    type: "list",
    name: "itemId",
    message: "Inventory:",
    choices: [...inventoryList, { name: "Return to Menu", value: null }],
  });

  if (!itemId) return showMainMenu(player);

  const item = getObject(itemId);
  if (item) {
    const result = await useItem(player, itemId);
    if (result) console.log(chalk.yellow(`\n${result}\n`));
  }

  return showInventory(player);
}

export async function showQuests(player: Player) {
  const activeQuests = getActiveQuests();

  if (activeQuests.length === 0) {
    console.log(chalk.yellow("\nNo active quests!"));
    return showMainMenu(player);
  }

  const { questId } = await inquirer.prompt<{ questId: string | null }>({
    type: "list",
    name: "questId",
    message: "Active Quests:",
    choices: [
      ...activeQuests.map((quest) => ({
        name: `${quest.id} [Started]`,
        value: quest.id,
      })),
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
      ? quest.dialogue.map((d) => {
          if (d.info && d.info.length > 0)
            return d.info[d.journalIndex ?? 0]?.text ?? d.id;
          return d.id;
        })
      : ["No journal entries yet."];

  journalEntries.forEach((entry, index) =>
    console.log(`${index + 1}. ${entry}`),
  );

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
  const creatureIds = actorIds.filter((id) => Boolean(getCreature(id)));
  if (creatureIds.length === 0) return null;
  const selected = creatureIds[Math.floor(Math.random() * creatureIds.length)];
  return createCreatureInstance(selected);
}

export async function enterCell(player: Player, cell: Cell) {
  const description = resolveDynamic(cell.description, player) ?? "";
  const displayName =
    resolveDynamic(cell.displayName, player) ?? cell.editorName;
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

        // Try to find the runtime Reference for this NPC in the current cell.
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
  }
  return showMainMenu(player);
}

async function showTravelMenu(player: Player) {
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

  if (destination === "__cancel") return showMainMenu(player);

  const selectedCell = getNonDynamicData().cells.find(
    (loc) => loc.id === destination,
  );
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
    const response = await inquirer.prompt<{ name: string }>({
      type: "input",
      name: "name",
      message: "Enter your name:",
      validate: (input: string) =>
        input.trim() !== "" || "Name cannot be empty!",
    });
    name = response.name.trim();
  }

  const classChoices = getNonDynamicData()
    .classes.filter((cls) => cls.playable)
    .map((cls) => ({
      name: cls.name,
      value: cls.id,
    }));

  const { className } = await inquirer.prompt<{ className: string }>({
    type: "list",
    name: "className",
    message: "Choose class:",
    choices: classChoices,
  });

  const player = new Player(name, className);
  game.player = player;

  await showMainMenu(player);
}
void startGame();
