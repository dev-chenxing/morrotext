import inquirer from "inquirer";
import chalk from "chalk";
import figlet from "figlet";
import { locations } from "./world.js";
import { Player } from "./player.js";
import { saveGame } from "./save.js";
import { startCombat } from "./combat.js";
import { talkToNPC } from "./dialogue.js";
import { ITEMS } from "./items.js";
import { CLASSES, EXP_LEVELS } from "./classes.js";
import { createEnemy } from "./combat.js";

// Display ASCII title
console.log(chalk.yellow(figlet.textSync("Terminal RPG")));

// Main menu system
export async function showMainMenu(player) {
  const { action } = await inquirer.prompt({
    type: "list",
    name: "action",
    message: "What would you like to do?",
    choices: ["Travel", "Check Stats", "View Inventory", "View Quests", "Save Game", "Exit Game"]
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
    case "Save Game":
      saveGame(player);
      console.log(chalk.green("Game saved!"));
      await showMainMenu(player);
      break;
    default:
      process.exit();
  }
}

function showPlayerStats(player) {
  console.log(chalk.blue("\n=== Character Stats ==="));
  console.log(`Name: ${player.name}`);
  console.log(`Class: ${player.class}`);
  console.log(`Level: ${player.level}`);
  console.log(`EXP: ${player.exp}/${EXP_LEVELS[player.level]}`);
  console.log(`HP: ${player.hp}/${player.maxHp}`);
  console.log(`Mana: ${player.mana}`);
  console.log(`Gold: ${player.gold}\n`);
}

export async function showInventory(player) {
  const equippedItems = [player.equipment.weapon?.id, player.equipment.armor?.id].filter(Boolean);

  const choices = player.inventory.map(itemId => {
    const item = ITEMS[itemId];
    const isEquipped = equippedItems.includes(itemId);
    return {
      name: `${item.name}${isEquipped ? " (Equipped)" : ""} [${item.type}]`,
      value: itemId
    };
  });

  const { itemId } = await inquirer.prompt({
    type: "list",
    name: "itemId",
    message: "Inventory:",
    choices: [...choices, { name: "Return to Menu", value: null }]
  });

  if (!itemId) return showMainMenu(player);

  const item = ITEMS[itemId];
  if (item.type === "consumable") {
    player.hp = Math.min(player.maxHp, player.hp + (item.effect.hp || 0));
    player.inventory = player.inventory.filter(i => i !== itemId);
    console.log(`Used ${item.name}!`);
  } else {
    await handleEquipment(player, item);
  }

  return showInventory(player);
}

async function handleEquipment(player, item) {
  const { action } = await inquirer.prompt({
    type: "list",
    name: "action",
    message: `What to do with ${item.name}?`,
    choices: [
      { name: "Equip", value: "equip" },
      { name: "Inspect", value: "inspect" },
      { name: "Cancel", value: "cancel" }
    ]
  });

  if (action === "equip") player.equipItem(item);
  if (action === "inspect") {
    console.log(chalk.yellow(`\n${item.name}:`));
    console.log(`Type: ${item.type}`);
    console.log(`Value: ${item.value} gold`);
    if (item.stats) Object.entries(item.stats).forEach(([stat, val]) => console.log(`${stat}: ${val > 0 ? "+" : ""}${val}`));
  }
}

export async function showQuests(player) {
  const { quest } = await inquirer.prompt({
    type: "list",
    name: "quest",
    message: "Active Quests:",
    choices: [...player.activeQuests.map(q => `${q.title} (${q.progress}/${q.objectives.length})`), "Return"]
  });

  if (quest === "Return") return showMainMenu(player);

  const selected = player.activeQuests.find(q => quest.startsWith(q.title));
  console.log(chalk.yellow(`\n${selected.title}`));
  console.log(`Steps:`);
  selected.objectives.forEach((step, i) => console.log(`${i + 1}. ${step} ${i < selected.progress ? "✓" : ""}`));

  return showQuests(player);
}

function getRandomEnemy(locationEnemies) {
  const enemyTypes = locationEnemies;
  const totalWeight = enemyTypes.length;
  const selected = enemyTypes[Math.floor(Math.random() * totalWeight)];
  return createEnemy(selected);
}

export async function enterLocation(player, location) {
  console.log(chalk.cyan(`\n=== ${location.name} ===`));
  console.log(location.description);

  // Random encounter check for dangerous areas
  if (location.enemies && Math.random() > 0.6) {
    const enemy = getRandomEnemy(location.enemies);
    await startCombat(player, enemy);
  }

  const { action } = await inquirer.prompt({
    type: "list",
    name: "action",
    message: "What would you like to do?",
    choices: [
      ...location.npcs.map(npc => `Talk to ${npc}`),
      // ...location.quests.map(quest => QUESTS[quest].title),
      "Return to Main Menu"
    ]
  });

  if (action.startsWith("Talk to")) {
    const npc = action.replace("Talk to ", "").toLowerCase();
    const result = await talkToNPC(npc, player);
    console.log(result);
    return enterLocation(player, location);
  }

  // if (action.startsWith("Investigate")) {
  //   const questKey = location.quests.find(q => action.includes(QUESTS[q].title));
  //   startQuest(player, QUESTS[questKey]);
  //   return enterLocation(player, location);
  // }

  return showMainMenu(player);
}

async function showTravelMenu(player) {
  const { destination } = await inquirer.prompt({
    type: "list",
    name: "destination",
    message: "Where would you like to travel?",
    choices: Object.values(locations).map(loc => loc.name)
  });

  const selectedLocation = Object.values(locations).find(loc => loc.name === destination);
  console.log(chalk.yellow(`\nTraveling to ${destination}...\n`));
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
  const classChoices = Object.keys(CLASSES).map(key => ({
    name: CLASSES[key].displayName,
    value: key
  }));

  const { name, className } = await inquirer.prompt([
    { type: "input", name: "name", message: "Enter your name:" },
    {
      type: "list",
      name: "className",
      message: "Choose class:",
      choices: classChoices
    }
  ]);

  const player = new Player(name, className);
  await showMainMenu(player);
}
startGame();
