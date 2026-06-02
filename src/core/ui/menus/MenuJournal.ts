import chalk from "chalk";
import type { Dialogue } from "../../../types.ts";
import { findQuest, getActiveQuests } from "../../systems/quest.ts";
import { select } from "../prompt.ts";

export async function showJournalMenu(): Promise<void> {
  const activeQuests = getActiveQuests();

  if (activeQuests.length === 0) {
    console.log(chalk.yellow("\nNo active quests!"));
    return;
  }

  const { questId } = await select<{ questId: string | null }>({
    message: "Active Quests:",
    choices: [
      ...activeQuests.map((quest) => ({
        name: `${quest.id} [Started]`,
        value: { questId: quest.id },
      })),
      { name: "Return", value: { questId: null } },
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
      ? quest.dialogue.map((d: Dialogue) => {
          if (d.info && d.info.length > 0) return d.info[d.journalIndex ?? 0]?.text ?? d.id;
          return d.id;
        })
      : ["No journal entries yet."];

  journalEntries.forEach((entry, index) => console.log(`${index + 1}. ${entry}`));

  await showJournalMenu();
}
