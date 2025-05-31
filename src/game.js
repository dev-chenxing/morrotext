import inquirer from "inquirer";
import chalk from "chalk";
import figlet from "figlet";
import { locations } from "./world/locations.js";
import { Player } from "./actors/Player.js";
import { startCombat } from "./systems/combat.js";
import { talkToNPC, npcDialogues } from "./systems/dialogue.js";
import { ITEMS, useItem } from "./items.js";
import { CLASSES } from "./classes.js";
import { createEnemy } from "./systems/combat.js";
import { exploreRuins } from "./world/ruins.js";
import { resolveDynamic } from "./utils/dynamicUtils.js"
import { showPlayerStats } from "./ui/hud.js";

process.on("uncaughtException", error => {
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
export async function showMainMenu(player) {
  const { action } = await inquirer.prompt({
    type: "list",
    name: "action",
    message: "What would you like to do?",
    choices: ["Travel", "Check Stats", "View Inventory", "View Quests", "Exit Game"]
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

export async function showInventory(player) {
  const inventoryList = Object.entries(player.inventory)
    .map(([id, count]) => {
      const item = ITEMS[id];
      const isEquipped = player.isItemEquipped(id);
      return {
        name: `${item.name}${isEquipped ? ' (Equipped)' : ''} x${count}`,
        value: id
      };
    });

  if (inventoryList.length === 0) {
    console.log(chalk.red('\nYour inventory is empty!'));
    return showMainMenu(player);
  }

  const { itemId } = await inquirer.prompt({
    type: "list",
    name: "itemId",
    message: "Inventory:",
    choices: [...inventoryList, { name: "Return to Menu", value: null }]
  });

  if (!itemId) return showMainMenu(player);

  const item = ITEMS[itemId];
  if (item) {
    const result = await useItem(player, itemId);
    if (result) console.log(chalk.yellow(`\n${result}\n`));
  }

  return showInventory(player);
}

export async function showQuests(player) {

  if (player.activeQuests.length === 0) {
    console.log(chalk.yellow('\nNo active quests!'));
    return showMainMenu(player);
  }

  const { quest } = await inquirer.prompt({
    type: "list",
    name: "quest",
    message: "Active Quests:",
    choices: [
      ...player.activeQuests.map(q => ({
        name: `${q.title} [${q.progress}/${q.objectives.length}]`,
        value: q
      })),
      { name: 'Return', value: null }
    ]
  });

  if (!quest) return showMainMenu(player);

  console.log(chalk.cyan(`\n=== ${quest.title} ===`));
  quest.objectives.forEach((obj, i) => {
    const status = i < quest.progress ? chalk.green('✓') : chalk.gray('◻');
    console.log(`${i + 1}. ${status} ${obj.description}`);
  });

  await showQuests(player);
}

function getRandomEnemy(locationEnemies) {
  const enemyTypes = locationEnemies;
  const totalWeight = enemyTypes.length;
  const selected = enemyTypes[Math.floor(Math.random() * totalWeight)];
  return createEnemy(selected);
}

export async function enterLocation(player, location) {
  const description = resolveDynamic(location.description, player);
  const enemies = resolveDynamic(location.enemies, player);
  if (location.name === 'Ancient Ruins') {

    const enemy = getRandomEnemy(enemies);
    await startCombat(player, enemy, location);
    await exploreRuins(player, location);

  } else {

    let inLocation = true;
    while (inLocation && player.hp > 0) {

      console.log(chalk.cyan(`\n=== ${location.name} ===`));
      console.log(chalk.hex('#8B4513')(description));

      const choices = [
        ...location.npcs.map(npcKey => ({
          name: `Talk to ${npcDialogues[npcKey]?.name || npcKey}`,
          value: `npc:${npcKey}`
        })),
        { name: 'Return to Main Menu', value: 'return' }
      ];

      if (enemies && enemies.length > 0) {
        choices.unshift({ name: 'Explore area', value: 'explore' },)
      }

      const { action } = await inquirer.prompt({
        type: "list",
        name: "action",
        message: "What would you like to do?",
        choices
      });

      if (action.startsWith("npc:")) {
        const npcKey = action.split(':')[1];
        await talkToNPC(npcKey, player);

        return enterLocation(player, location);
      } else if (action === 'explore') {
        if (enemies && enemies.length > 0) {
          const enemy = getRandomEnemy(enemies);
          await startCombat(player, enemy, location);
        }
      } else {
        inLocation = false;
      }
    }
  }
  return showMainMenu(player);
}

async function showTravelMenu(player) {

  const availableLocations = Object.values(locations).filter(loc => {
    // Check travel conditions
    if (loc.travelCondition && !loc.travelCondition(player)) {
      return false;
    }
    return true;
  });

  const { destination } = await inquirer.prompt({
    type: "list",
    name: "destination",
    message: "Where would you like to travel?",
    choices: [
      ...availableLocations.map(loc => loc.name),
      'Cancel'
    ]
  });

  if (destination === 'Cancel') return showMainMenu(player);

  const selectedLocation = Object.values(locations).find(loc => loc.name === destination);
  console.log(chalk.yellow(`\nTraveling to ${destination}...`));
  await enterLocation(player, selectedLocation);
}

let storyFlags = { savedVillage: false, artifactDestroyed: false };

function checkEndings() {
  if (storyFlags.artifactDestroyed) {
    console.log(chalk.green("Peaceful Ending: You prevented the artifact's misuse!"));
    process.exit();
  }
  // Other endings...
}

// Initialize game
async function startGame() {

  let name = '';
  while (!name.trim()) {
    const response = await inquirer.prompt({
      type: 'input',
      name: 'name',
      message: 'Enter your name:',
      validate: input =>
        input.trim() !== '' || 'Name cannot be empty!'
    });
    name = response.name.trim();
  }

  const classChoices = Object.keys(CLASSES).map(key => ({
    name: CLASSES[key].displayName,
    value: key
  }));

  const { className } = await inquirer.prompt(
    {
      type: "list",
      name: "className",
      message: "Choose class:",
      choices: classChoices
    }
  );

  const player = new Player(name, className);

  setInterval(() => {
    player.updateEffects();
  }, 100); // Check every 1/10 second

  await showMainMenu(player);
}
startGame();
