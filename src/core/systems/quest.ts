import chalk from "chalk";
import { JOURNAL, type QuestRegistryEntry } from "../../data/quests.ts";
import type { Dialogue, Quest } from "../../types.ts";
import { DIALOGUE_TYPE, OBJECT_TYPE } from "../../constants.ts";
import { hashString, stableSerialize } from "../utils/index.ts";

function createDialogueInfoId(dialogueId: string, info: object): string {
  const base = `${dialogueId}-${stableSerialize(info)}`;
  return hashString(base);
}

export function createQuest(entry: QuestRegistryEntry): Quest {
  return {
    id: entry.dialogue[0]?.id ?? entry.id,
    objectType: OBJECT_TYPE.QUEST,
    dialogue: entry.dialogue.map((d) => ({
      ...d,
      type: DIALOGUE_TYPE.JOURNAL,
      objectType: OBJECT_TYPE.DIALOGUE,
      info: d.info.map((info) => ({ ...info, id: createDialogueInfoId(d.id, info) })),
      journalIndex: 0,
    })),
    isActive: false,
    isStarted: false,
    isFinished: false,
  };
}

function matchesQuestKey(quest: Quest, key: string): boolean {
  return (
    quest.id === key ||
    quest.dialogue?.some((dialogue) => {
      const questName = (dialogue as Dialogue & { questName?: string }).questName;
      return dialogue.id === key || questName === key;
    }) === true
  );
}

export function findQuest(journal?: Dialogue | string, name?: string): Quest | undefined {
  const quests = mt.worldController.quests;
  if (!quests || quests.length === 0) return undefined;

  if (journal) {
    if (typeof journal !== "string") {
      const byObj = quests.find((quest) => quest.dialogue?.some((d) => d === journal));
      if (byObj) return byObj;

      const byDialogueId = quests.find((quest) => quest.dialogue?.some((d) => d.id === journal.id));
      if (byDialogueId) return byDialogueId;

      const byQuestId = quests.find((quest) => matchesQuestKey(quest, journal.id));
      if (byQuestId) return byQuestId;
    } else {
      const byJournal = quests.find((quest) => matchesQuestKey(quest, journal));
      if (byJournal) return byJournal;
      const byId = quests.find((quest) => matchesQuestKey(quest, journal));
      if (byId) return byId;
    }
  }

  if (name) {
    const byId = quests.find((quest) => matchesQuestKey(quest, name));
    if (byId) return byId;
  }

  return undefined;
}

export function getJournalIndex(id: Dialogue | string): number | null {
  if (typeof id !== "string") {
    const quest = findQuest(id);
    if (quest && quest.dialogue) {
      const target = quest.dialogue.find((entry) => entry === id || entry.id === id.id);
      if (target) return target.journalIndex ?? 0;
    }

    const journalId = id.id;
    for (const q of JOURNAL) {
      const target = q.dialogue.find((d) => d.id === journalId || d.questName === journalId);
      if (target) return 0;
    }

    return null;
  }

  const quest = findQuest(id);
  if (quest && quest.dialogue) {
    const target = quest.dialogue.find(
      (dialogue) =>
        dialogue.id === id || (dialogue as Dialogue & { questName?: string }).questName === id,
    );
    if (target) return target.journalIndex ?? 0;
  }

  for (const q of JOURNAL) {
    const target = q.dialogue.find((dialogue) => dialogue.id === id || dialogue.questName === id);
    if (target) return 0;
  }

  return null;
}

export function getActiveQuests(): Quest[] {
  return mt.worldController.quests.filter((quest) => quest.isActive === true);
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

export function updateJournal(id: Dialogue | string, index: number, showMessage: boolean = true) {
  const quest = findQuest(id);
  if (!quest) return false;

  quest.isActive = true;
  quest.isStarted = true;
  quest.isFinished = false;

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
      if (showMessage) console.log(chalk.yellow("\nCannot move journal entry backwards."));
      return false;
    }

    target.journalIndex = index;
  } else if (quest.dialogue && quest.dialogue.length > 0) {
    const current = quest.dialogue[0].journalIndex ?? 0;
    if (index < current) {
      if (showMessage) console.log(chalk.yellow("\nCannot move journal entry backwards."));
      return false;
    }

    quest.dialogue[0].journalIndex = index;
  }

  if (showMessage) {
    console.log(chalk.green("\nYour journal has been updated."));
  }

  return true;
}
