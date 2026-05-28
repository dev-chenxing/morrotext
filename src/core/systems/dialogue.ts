import inquirer from "inquirer";
import chalk from "chalk";
import type {
  Actor,
  Dialogue,
  DialogueContext,
  DialogueExecutionResult,
  DialogueInfo,
  Player,
  Reference,
} from "../../types.ts";
import { getCreature, getDialogues, getNPC } from "../gameState.ts";

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

function getDialogueContext(actor: Actor, player: Player, reference: Reference): DialogueContext {
  return { actor, player, reference };
}

function getMatchingEntry(entries: DialogueInfo[], context: DialogueContext): DialogueInfo | null {
  const matchingEntries = entries
    .filter((entry) => (entry.condition ? entry.condition(context) : true))
    .sort((left, right) => (right.priority ?? 0) - (left.priority ?? 0));

  return matchingEntries[0] ?? null;
}

function getGreetingMatch(context: DialogueContext): DialogueMatch | null {
  const greetings = Object.values(getDialogues().greetings)
    .map((greeting) => {
      const entry = getMatchingEntry(greeting.info, context);
      return entry ? { dialogue: greeting, entry } : null;
    })
    .filter((match): match is DialogueMatch => match !== null)
    .sort((left, right) => (right.entry.priority ?? 0) - (left.entry.priority ?? 0));

  return greetings[0] ?? null;
}

function getTopicMatches(context: DialogueContext): Array<DialogueMatch> {
  return Object.values(getDialogues().topics)
    .map((topic) => {
      const entry = getMatchingEntry(topic.info, context);
      return entry ? { dialogue: topic, entry } : null;
    })
    .filter((match): match is DialogueMatch => match !== null)
    .sort((left, right) => {
      const byPriority = (right.entry.priority ?? 0) - (left.entry.priority ?? 0);
      if (byPriority !== 0) return byPriority;
      return left.dialogue.id.localeCompare(right.dialogue.id);
    });
}

async function runEntryResult(
  entry: DialogueInfo,
  context: DialogueContext,
): Promise<DialogueExecutionResult | undefined> {
  if (!entry.result) return undefined;
  const result = await Promise.resolve(entry.result(context));
  return result ?? undefined;
}

function shouldExitDialogue(reference: Reference, result?: DialogueExecutionResult): boolean {
  if ((reference.tempData as Record<string, unknown>).__dialogue_exit) {
    delete (reference.tempData as Record<string, unknown>).__dialogue_exit;
    return true;
  }

  return result?.exit === true;
}

function printEntryText(text: string): void {
  console.log(chalk.yellow(`\n${text}`));
}

function printResult(result?: DialogueExecutionResult): void {
  if (!result) return;
  if (result.message) {
    console.log(chalk.yellow(`\n${result.message}`));
  }
  result.effect?.();
}

export function canTalkToActor(actorOrRef: Actor | Reference, player: Player): boolean {
  const { actor, reference } = resolveActorReference(actorOrRef);
  const context = getDialogueContext(actor, player, reference);
  return getGreetingMatch(context) !== null || getTopicMatches(context).length > 0;
}

export async function talkToActor(actorOrRef: Actor | Reference, player: Player) {
  const { actor, reference } = resolveActorReference(actorOrRef);
  const context = getDialogueContext(actor, player, reference);

  if (!canTalkToActor(actorOrRef, player)) {
    console.log(chalk.yellow(`${actor.name} has nothing to say.`));
    return;
  }

  console.log(chalk.cyan(`\n=== ${actor.name} ===`));

  const greeting = getGreetingMatch(context);
  if (greeting) {
    printEntryText(greeting.entry.text);
    const greetingResult = await runEntryResult(greeting.entry, context);
    printResult(greetingResult);
    if (shouldExitDialogue(reference, greetingResult)) {
      return;
    }
  }

  while (true) {
    const topics = getTopicMatches(context);

    if (topics.length === 0) {
      console.log(chalk.yellow("There are no topics to discuss."));
      return;
    }

    const { topicId } = await inquirer.prompt<{ topicId: string | null }>({
      type: "list",
      name: "topicId",
      message: `Ask ${actor.name} about:`,
      choices: [
        ...topics.map((topic) => ({ name: topic.dialogue.id, value: topic.dialogue.id })),
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
    const result = await runEntryResult(selectedTopic.entry, context);
    printResult(result);

    if (shouldExitDialogue(reference, result)) {
      return;
    }
  }
}

export const talkToNPC = talkToActor;

export function getNPCName(npcKey: string) {
  return getNPC(npcKey)?.name ?? getCreature(npcKey)?.name ?? npcKey;
}
