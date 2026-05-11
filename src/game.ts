import inquirer from "inquirer";
import chalk from "chalk";
import figlet from "figlet";
import { areas } from "./world/areas.ts";
import { Player } from "./actors/Player.ts";
import { startCombat } from "./systems/combat.ts";
import { talkToNPC, npcDialogues } from "./systems/dialogue.ts";
import { ITEMS, useItem } from "./items.ts";
import { CLASSES } from "./classes.ts";
import { GAME_TIMINGS } from "./constants.ts";
import { createCreature } from "./systems/combat.ts";
import { exploreRuins } from "./world/ruins.ts";
import { resolveDynamic } from "./utils/dynamicUtils.ts";
import { showPlayerStats } from "./ui/hud.ts";
import type { ActiveQuest, Area } from "./types.ts";

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
console.log(chalk.yellow(figlet.textSync("Terminal RPG")));

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
      showPlayerStats(player);
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
  const inventoryList = Object.entries(player.inventory).map(([id, count]) => {
    const item = ITEMS[id];
    const isEquipped = player.isItemEquipped(id);
    return {
      name: `${item.name}${isEquipped ? " (Equipped)" : ""} x${count}`,
      value: id,
    };
  });

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

  const item = ITEMS[itemId];
  if (item) {
    const result = await useItem(player, itemId);
    if (result) console.log(chalk.yellow(`\n${result}\n`));
  }

  return showInventory(player);
}

export async function showQuests(player: Player) {
  if (player.activeQuests.length === 0) {
    console.log(chalk.yellow("\nNo active quests!"));
    return showMainMenu(player);
  }

  const { quest } = await inquirer.prompt<{ quest: ActiveQuest | null }>({
    type: "list",
    name: "quest",
    message: "Active Quests:",
    choices: [
      ...player.activeQuests.map((q: ActiveQuest) => ({
        name: `${q.title} [${q.progress}/${q.objectives.length}]`,
        value: q,
      })),
      { name: "Return", value: null },
    ],
  });

  if (!quest) return showMainMenu(player);

  console.log(chalk.cyan(`\n=== ${quest.title} ===`));
  quest.objectives.forEach((obj, i) => {
    const status = i < quest.progress ? chalk.green("✓") : chalk.gray("◻");
    console.log(`${i + 1}. ${status} ${obj.description}`);
  });

  await showQuests(player);
}

function getRandomCreature(areaEnemies: string[]) {
  const creatureTypes = areaEnemies;
  const totalWeight = creatureTypes.length;
  const selected = creatureTypes[Math.floor(Math.random() * totalWeight)];
  return createCreature(selected);
}

export async function enterArea(player: Player, area: Area) {
  const description = resolveDynamic(area.description, player) ?? "";
  const enemies = resolveDynamic(area.enemies, player) ?? [];
  if (area.name === "Ancient Ruins") {
    const creature = getRandomCreature(enemies);
    await startCombat(player, creature, area);
    await exploreRuins(player, area);
  } else {
    let inArea = true;
    while (inArea && player.stats.hp > 0) {
      console.log(chalk.cyan(`\n=== ${area.name} ===`));
      console.log(chalk.hex("#8B4513")(description));

      const choices = [
        ...area.npcs.map((npcKey: string) => ({
          name: `Talk to ${npcDialogues[npcKey]?.name || npcKey}`,
          value: `npc:${npcKey}`,
        })),
        { name: "Return to Main Menu", value: "return" },
      ];

      if (enemies && enemies.length > 0) {
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
        await talkToNPC(npcKey, player);

        return enterArea(player, area);
      } else if (action === "explore") {
        if (enemies && enemies.length > 0) {
          const creature = getRandomCreature(enemies);
          await startCombat(player, creature, area);
        }
      } else {
        inArea = false;
      }
    }
  }
  return showMainMenu(player);
}

async function showTravelMenu(player: Player) {
  const availableAreas = Object.values(areas).filter((loc) => {
    // Check travel conditions
    if (loc.travelCondition && !loc.travelCondition(player)) {
      return false;
    }
    return true;
  });

  const { destination } = await inquirer.prompt<{ destination: string }>({
    type: "list",
    name: "destination",
    message: "Where would you like to travel?",
    choices: [...availableAreas.map((loc) => loc.name), "Cancel"],
  });

  if (destination === "Cancel") return showMainMenu(player);

  const selectedArea = Object.values(areas).find(
    (loc) => loc.name === destination,
  );
  if (!selectedArea) {
    console.log(chalk.red("Unknown destination selected."));
    return showMainMenu(player);
  }

  console.log(chalk.yellow(`\nTraveling to ${destination}...`));
  await enterArea(player, selectedArea);
}

// Initialize game
async function startGame() {
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

  const classChoices = Object.entries(CLASSES).map(([key, cls]) => ({
    name: cls.name,
    value: key,
  }));

  const { className } = await inquirer.prompt<{ className: string }>({
    type: "list",
    name: "className",
    message: "Choose class:",
    choices: classChoices,
  });

  const player = new Player(name, className);

  setInterval(() => {
    player.updateEffects();
  }, GAME_TIMINGS.EFFECT_TICK_INTERVAL_MS);

  await showMainMenu(player);
}
void startGame();
