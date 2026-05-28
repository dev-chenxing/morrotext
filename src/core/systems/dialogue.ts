import inquirer from "inquirer";
import chalk from "chalk";
import type {
  Actor,
  Dialogue,
  DialogueInfo,
  Player,
  Reference,
  ValueOf,
} from "../../types.ts";
import { DIALOGUE_TYPE } from "../../constants.ts";
import { getCreature, getDialogues, getNPC } from "../gameState.ts";
import { hasStartedQuest, hasCompletedQuest } from "../systems/quest.ts";

type DialogueMatch = { dialogue: Dialogue; entry: DialogueInfo };

type NamedActor = Actor & { name: string };

function createTemporaryReference(actor: Actor): Reference {
  return {
    id: `${actor.id}-temp-ref`,
    objectType: actor.objectType as Reference["objectType"],
    data: {},
    tempData: {},
    object: actor,
    cell: null,
  } as Reference;
}

function resolveActorReference(actorOrRef: Actor | Reference): {
  actor: NamedActor;
  reference: Reference;
} {
  if ((actorOrRef as Reference).object !== undefined) {
    const reference = actorOrRef as Reference;
    return { actor: reference.object as NamedActor, reference };
  }

  const actor = actorOrRef as NamedActor;
  return { actor, reference: createTemporaryReference(actor) };
}

function matchesFilters(
  entry: DialogueInfo,
  actor: Actor,
  player: Player,
  reference: Reference,
): boolean {
  // Actor filter
  if (entry.actor) {
    if (entry.actor.id !== actor.id) return false;
  }

  // Cell filter
  if (entry.cell) {
    if (!reference.cell) return false;
    if (entry.cell.id !== reference.cell.id) return false;
  }

  // Object type filter
  if (entry.objectType) {
    if (actor.objectType !== entry.objectType) return false;
  }

  // NPC class filter
  if (entry.npcClass) {
    const actorClass = (actor as any).class;
    if (!actorClass) return false;
    if ((entry.npcClass as any).id !== actorClass.id) return false;
  }

  // Other filters such as `journalIndex` or `isQuestFinished` are handled
  // here — entries should use explicit filter fields. Use `runScript` for
  // side-effects after an entry has been selected.
  if (
    entry.id &&
    entry.journalIndex !== undefined &&
    entry.journalIndex !== null
  ) {
    const started = hasStartedQuest(entry.id);
    // If the entry is for the not-started case (journalIndex < 1) but the
    // quest has started, skip it.
    if ((entry.journalIndex ?? 0) < 1 && started) return false;
    // If the entry is for started quests (journalIndex >= 1) but the quest
    // has not started, skip it.
    if ((entry.journalIndex ?? 0) >= 1 && !started) return false;
  }

  // Quest-finished filter (requires entry.id to resolve which quest).
  if (
    entry.isQuestFinished !== undefined &&
    entry.isQuestFinished !== null &&
    entry.id
  ) {
    const wantFinished = Boolean(entry.isQuestFinished);
    const finished = hasCompletedQuest(entry.id) || false;
    if (wantFinished !== finished) return false;
  }

  return true;
}

function getMatchingEntry(
  entries: DialogueInfo[],
  actor: Actor,
  player: Player,
  reference: Reference,
): DialogueInfo | null {
  const matchingEntries = entries
    .filter((entry) => matchesFilters(entry, actor, player, reference))
    .sort((left, right) => (right.priority ?? 0) - (left.priority ?? 0));

  return matchingEntries[0] ?? null;
}

function getGreetingMatch(
  actor: Actor,
  player: Player,
  reference: Reference,
): DialogueMatch | null {
  const matches = getMatchesForType(
    DIALOGUE_TYPE.GREETING,
    actor,
    player,
    reference,
  );
  return matches[0] ?? null;
}

function getTopicMatches(
  actor: Actor,
  player: Player,
  reference: Reference,
): Array<DialogueMatch> {
  return getMatchesForType(DIALOGUE_TYPE.TOPIC, actor, player, reference);
}

function getMatchesForType(
  type: ValueOf<typeof DIALOGUE_TYPE>,
  actor: Actor,
  player: Player,
  reference: Reference,
): Array<DialogueMatch> {
  return getDialogues()
    .filter((d) => d.type === type)
    .map((item) => {
      const entry = getMatchingEntry(item.info, actor, player, reference);
      return entry ? { dialogue: item, entry } : null;
    })
    .filter((match): match is DialogueMatch => match !== null)
    .sort((left, right) => {
      const byPriority =
        (right.entry.priority ?? 0) - (left.entry.priority ?? 0);
      if (byPriority !== 0) return byPriority;
      return left.dialogue.id.localeCompare(right.dialogue.id);
    });
}

async function runEntryScript(
  entry: DialogueInfo,
  reference: Reference,
): Promise<void> {
  // Prefer new `runScript(reference)` API.
  if (entry.runScript) {
    await Promise.resolve(entry.runScript(reference));
    return;
  }

  // No legacy `result` support: use `runScript` for side-effects.
}

function shouldExitDialogue(reference: Reference): boolean {
  if ((reference.tempData as Record<string, unknown>).__dialogue_exit) {
    delete (reference.tempData as Record<string, unknown>).__dialogue_exit;
    return true;
  }

  return false;
}

function printEntryText(text: string): void {
  console.log(chalk.yellow(`\n${text}`));
}

export function canTalkToActor(
  actorOrRef: Actor | Reference,
  player: Player,
): boolean {
  const { actor, reference } = resolveActorReference(actorOrRef);
  return (
    getGreetingMatch(actor, player, reference) !== null ||
    getTopicMatches(actor, player, reference).length > 0
  );
}

export async function talkToActor(
  actorOrRef: Actor | Reference,
  player: Player,
) {
  const { actor, reference } = resolveActorReference(actorOrRef);

  if (!canTalkToActor(actorOrRef, player)) {
    console.log(chalk.yellow(`${actor.name} has nothing to say.`));
    return;
  }

  console.log(chalk.cyan(`\n=== ${actor.name} ===`));

  const greeting = getGreetingMatch(actor, player, reference);
  if (greeting) {
    printEntryText(greeting.entry.text);
    await runEntryScript(greeting.entry, reference);
    if (shouldExitDialogue(reference)) {
      return;
    }
  }

  while (true) {
    const topics = getTopicMatches(actor, player, reference);

    if (topics.length === 0) {
      console.log(chalk.yellow("There are no topics to discuss."));
      return;
    }

    const { topicId } = await inquirer.prompt<{ topicId: string | null }>({
      type: "list",
      name: "topicId",
      message: `Ask ${actor.name} about:`,
      choices: [
        ...topics.map((topic) => ({
          name: topic.dialogue.id,
          value: topic.dialogue.id,
        })),
        { name: "Goodbye", value: null },
      ],
    });

    if (!topicId) {
      return;
    }

    const selectedTopic = topics.find((topic) => topic.dialogue.id === topicId);
    if (!selectedTopic) {
      continue;
    }

    printEntryText(selectedTopic.entry.text);
    await runEntryScript(selectedTopic.entry, reference);

    if (shouldExitDialogue(reference)) {
      return;
    }
  }
}

export const talkToNPC = talkToActor;

export function getNPCName(npcKey: string) {
  return getNPC(npcKey)?.name ?? getCreature(npcKey)?.name ?? npcKey;
}
