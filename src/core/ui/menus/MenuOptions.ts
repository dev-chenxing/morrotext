import chalk from "chalk";
import figlet from "figlet";
import { select } from "../prompt.ts";

const title = "MORROTEXT";
const subtitle = "Morrowind but Text-Based RPG";
const separatorChar = "─";

function renderAsciiTitle(title: string): string {
  const groups = [
    figlet.textSync(title[0], { font: "Varsity" }),
    figlet.textSync(title.slice(1, -1), { font: "Small" }),
    figlet.textSync(title[title.length - 1], { font: "Varsity" }),
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

console.clear();
console.log();
console.log(chalk.yellow(" ".repeat(Math.max(0, pad)) + subtitle));
console.log(chalk.yellow(separatorChar.repeat(titleWidth)));
console.log(chalk.bold.yellow(asciiTitle));

export async function showMainMenu(): Promise<"new" | "exit"> {
  const { action } = await select<{ action: "new" | "exit" }>({
    message: "",
    choices: [
      { name: "New", value: { action: "new" } },
      { name: "Exit", value: { action: "exit" } },
    ],
  });

  return action;
}
