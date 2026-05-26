import inquirer from "inquirer";
import chalk from "chalk";
import { findQuest, getActiveQuests } from "../../systems/quest.ts";

export async function showQuestsMenu(): Promise<void> {
  const activeQuests = getActiveQuests();

  if (activeQuests.length === 0) {
    console.log(chalk.yellow("\nNo active quests!"));
    return;
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

  if (!questId) return;

  const quest = findQuest(undefined, questId);
  if (!quest) {
    return;
  }

  console.log(chalk.cyan(`\n=== ${quest.id} ===`));
  console.log(`Status: ${quest.isFinished ? "Completed" : "Started"}`);

  const journalEntries =
    quest.dialogue.length > 0
      ? quest.dialogue.map((d) => {
          if (d.info && d.info.length > 0) return d.info[d.journalIndex ?? 0]?.text ?? d.id;
          return d.id;
        })
      : ["No journal entries yet."];

  journalEntries.forEach((entry, index) => console.log(`${index + 1}. ${entry}`));

  await showQuestsMenu();
}
