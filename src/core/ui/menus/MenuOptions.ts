import inquirer from "inquirer";
import chalk from "chalk";
import figlet from "figlet";
import { Player } from "../../actors/Player.ts";
import { showInventoryMenu } from "./MenuInventory.ts";
import { showQuestsMenu } from "./MenuQuests.ts";
import { showStatsMenu } from "./MenuStat.ts";
import { showTravelMenu } from "./MenuTravel.ts";

const title = "MORROTEXT";
const subtitle = "The Text-Based RPG";
const separatorChar = "─";

function renderAsciiTitle(title: string): string {
  const groups = [
    figlet.textSync(title[0], { font: "Big" }),
    figlet.textSync(title.slice(1, -1), { font: "Small" }),
    figlet.textSync(title[title.length - 1], { font: "Big" }),
  ].map((raw) => {
    const lines = raw.split("\n").map((l) => l.trimEnd());
    while (lines.length > 0 && lines[lines.length - 1].trim() === "") {
      lines.pop();
    }
    const minIndent = Math.min(...lines.filter((l) => l.trim() !== "").map((l) => l.search(/\S/)));
    return minIndent > 0 ? lines.map((l) => l.slice(minIndent)) : lines;
  });

  const maxHeight = Math.max(...groups.map((g) => g.length));

  const padded = groups.map((lines) => {
    const width = Math.max(...lines.map((l) => l.length), 0);
    return [
      ...lines.map((l) => l.padEnd(width)),
      ...Array(maxHeight - lines.length).fill(" ".repeat(width)),
    ];
  });

  return Array.from({ length: maxHeight }, (_, i) =>
    padded.map((lines) => lines[i] ?? "").join(""),
  ).join("\n");
}

const asciiTitle = renderAsciiTitle(title);
const titleWidth = Math.max(...asciiTitle.split("\n").map((l) => l.length));
const pad = Math.floor((titleWidth - subtitle.length) / 2);

console.log(chalk.yellow(" ".repeat(Math.max(0, pad)) + subtitle));
console.log(chalk.yellow(separatorChar.repeat(titleWidth)));
console.log(chalk.yellow(asciiTitle));

export async function showMainMenu(player: Player): Promise<void> {
  while (true) {
    const { action } = await inquirer.prompt({
      type: "list",
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
        break;
      case "View Inventory":
        await showInventoryMenu(player);
        break;
      case "View Quests":
        await showQuestsMenu();
        break;
      default:
        process.exit();
    }
  }
}
