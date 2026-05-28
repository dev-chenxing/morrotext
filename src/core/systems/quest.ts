import chalk from "chalk";
import { DIALOGUE_TYPE, OBJECT_TYPE } from "../../constants.ts";
import { QUESTS } from "../../data/quests.ts";
import type { Dialogue, Quest } from "../../types.ts";
import { game } from "../gameState.ts";

function cloneQuestDialogue(questId: string) {
  const questEntry = QUESTS.find((entry) => entry.id === questId);
  return (
    questEntry?.dialogue.map((dialogue) => ({
      ...dialogue,
      type: DIALOGUE_TYPE.JOURNAL,
      objectType: OBJECT_TYPE.DIALOGUE,
      info: dialogue.info.map((info) => ({ ...info, id: questId })),
      journalIndex: 0,
    })) ?? []
  );
}

export function findQuest(
  journal?: Dialogue | string,
  name?: string,
): Quest | undefined {
  const quests = game.worldController.quests;
  if (!quests || quests.length === 0) return undefined;

  if (journal) {
    if (typeof journal !== "string") {
      const byObj = quests.find((quest) =>
        quest.dialogue?.some((d) => d === journal),
      );
      if (byObj) return byObj;

      const byDialogueId = quests.find((quest) =>
        quest.dialogue?.some((d) => d.id === journal.id),
      );
      if (byDialogueId) return byDialogueId;

      const byQuestId = quests.find((quest) => quest.id === journal.id);
      if (byQuestId) return byQuestId;
    } else {
      const byJournal = quests.find((quest) =>
        quest.dialogue?.some((d) => d.id === journal),
      );
      if (byJournal) return byJournal;
      const byId = quests.find((quest) => quest.id === journal);
      if (byId) return byId;
    }
  }

  if (name) {
    const byId = quests.find((quest) => quest.id === name);
    if (byId) return byId;
  }

  return undefined;
}

export function getJournalIndex(id: Dialogue | string): number | null {
  if (typeof id !== "string") {
    const quest = findQuest(id);
    if (quest && quest.dialogue) {
      const idx = quest.dialogue.indexOf(id);
      if (idx !== -1) return idx;
    }

    const journalId = id.id;
    for (const q of QUESTS) {
      const idx = q.dialogue.findIndex((d) => d.id === journalId);
      if (idx !== -1) return idx;
    }

    return null;
  }

  const quest = findQuest(id);
  if (quest && quest.dialogue) {
    const idx = quest.dialogue.findIndex((d) => d.id === id);
    if (idx !== -1) return idx;
  }

  for (const q of QUESTS) {
    const idx = q.dialogue.findIndex((d) => d.id === id);
    if (idx !== -1) return idx;
  }

  return null;
}

export function getActiveQuests(): Quest[] {
  return game.worldController.quests.filter((quest) => quest.isActive === true);
}

export function hasStartedQuest(questId: string): boolean {
  return findQuest(undefined, questId)?.isStarted === true;
}

export function hasCompletedQuest(questId: string): boolean {
  return findQuest(undefined, questId)?.isFinished === true;
}

export function isQuestAvailable(questId: string): boolean {
  const quest = findQuest(undefined, questId);
  if (!quest) return false;
  return quest.isStarted !== true && quest.isFinished !== true;
}

export function startQuest(questId: string): Quest | null {
  const quest = findQuest(undefined, questId);
  if (!quest) return null;

  if (quest.isStarted === true && quest.isFinished !== true) return null;

  quest.isActive = true;
  quest.isStarted = true;
  quest.isFinished = false;
  quest.dialogue = cloneQuestDialogue(questId);
  console.log(`New quest started: "${questId}"`);
  return quest;
}

export function updateJournal(
  id: Dialogue | string,
  index: number,
  showMessage = true,
) {
  const quest = findQuest(id);
  if (!quest) return false;

  quest.isActive = true;

  let target: Dialogue | undefined;
  if (typeof id === "string") {
    target = quest.dialogue.find((d) => d.id === id);
  } else {
    target = quest.dialogue.find((d) => d === id || d.id === id.id);
  }

  // Enforce monotonicity: allow moving forward or staying the same, but
  // disallow moving the journal index backwards.
  if (target) {
    const current = target.journalIndex ?? 0;
    if (index < current) {
      if (showMessage)
        console.log(chalk.yellow("\nCannot move journal entry backwards."));
      return false;
    }

    target.journalIndex = index;
  } else if (quest.dialogue && quest.dialogue.length > 0) {
    const current = quest.dialogue[0].journalIndex ?? 0;
    if (index < current) {
      if (showMessage)
        console.log(chalk.yellow("\nCannot move journal entry backwards."));
      return false;
    }

    quest.dialogue[0].journalIndex = index;
  }

  if (showMessage) {
    console.log(chalk.green("\nYour journal has been updated."));
  }

  return true;
}

export function completeQuest(questId: string) {
  const quest = findQuest(undefined, questId);
  if (!quest) return;

  quest.isActive = false;
  quest.isStarted = true;
  quest.isFinished = true;
  console.log(chalk.green(`\nQuest "${questId}" completed!`));
}
