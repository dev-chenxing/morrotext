import chalk from "chalk";
import type { Dialogue, Quest } from "../types.ts";
import { game } from "../gameState.ts";

export function findQuest(journal?: Dialogue | string, name?: string): Quest | undefined {
  const quests = game.worldController.quests;
  if (!quests || quests.length === 0) return undefined;

  if (journal) {
    // If a Dialogue object is provided, prefer identity match in runtime quests.
    if (typeof journal !== "string") {
      const byObj = quests.find((quest) => quest.dialogue?.some((d) => d === journal));
      if (byObj) return byObj;

      // Fallback to matching by dialogue id
      const byDialogueId = quests.find((quest) => quest.dialogue?.some((d) => d.id === journal.id));
      if (byDialogueId) return byDialogueId;

      // Finally, maybe the dialogue id equals the quest id
      const byQuestId = quests.find((quest) => quest.id === journal.id);
      if (byQuestId) return byQuestId;
    } else {
      // journal is a string id: match dialogue entries or quest id
      const byJournal = quests.find((quest) => quest.dialogue?.some((d) => d.id === journal));
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
  // If a Dialogue object is supplied, try to use object identity first.
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

  // `id` is a string journal id
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
  quest.dialogue = [];
  console.log(`New quest started: "${questId}"`);
  return quest;
}

export function updateJournal(
  id: Dialogue | string,
  index: number,
  // speaker: MobileActor | Reference | string = game.mobilePlayer,
  showMessage = true,
) {
  const quest = findQuest(id);
  if (!quest) return false;

  // Mark quest active when the journal is updated
  quest.isActive = true;

  // Try to find the related dialogue entry within the quest and set its
  // journalIndex. If not found, fall back to the first dialogue entry.
  let target: Dialogue | undefined;
  if (typeof id === "string") {
    target = quest.dialogue.find((d) => d.id === id);
  } else {
    target = quest.dialogue.find((d) => d === id || d.id === id.id);
  }

  if (target) {
    target.journalIndex = index;
  } else if (quest.dialogue && quest.dialogue.length > 0) {
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

// quest definition
export type QuestRegistryEntry = {
  id: string;
  dialogue: {
    id: string;
    info: { text: string; journalIndex: number }[];
  }[];
};

export const QUESTS: QuestRegistryEntry[] = [
  {
    id: "Investigate the Ancient Ruins",
    dialogue: [
      {
        id: "investigate_ruins",
        info: [
          {
            text: "The Hermit seems interested in the ancient ruins to the north. Maybe I should talk to him.",
            journalIndex: 1,
          },
        ],
      },
    ],
  },
  {
    id: "Investigate the Ancient Ruins",
    dialogue: [
      {
        id: "investigate_ruins",
        info: [
          {
            text: "The Hermit seems interested in the ancient ruins to the north. Maybe I should talk to him.",
            journalIndex: 1,
          },
        ],
      },
    ],
  },
  {
    id: "slay_goblins",
    dialogue: [
      {
        id: "slay_goblins",
        info: [
          {
            text: "Goblins have been spotted near the village. I should deal with them.",
            journalIndex: 1,
          },
        ],
      },
    ],
  },
  {
    id: "special_orders",
    dialogue: [
      {
        id: "special_orders",
        info: [
          {
            text: "The Smith has requested special orders. I should check on them.",
            journalIndex: 1,
          },
        ],
      },
    ],
  },
];
