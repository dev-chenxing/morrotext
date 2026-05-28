import { DIALOGUE_TYPE, GOLD_ID, OBJECT_TYPE } from "../constants.ts";
import { hasStartedQuest, startQuest } from "../core/systems/quest.ts";
import type {
  DialogueContext,
  DialogueEntry,
  DialogueExecutionResult,
  DialogueRecordSet,
} from "../types.ts";

const noOpResult = (): void => {};

const exitDialogue = ({ reference }: DialogueContext): DialogueExecutionResult => {
  (reference.tempData as Record<string, unknown>).__dialogue_exit = true;
  return { exit: true };
};

const matchSpeaker =
  (speakerId: string) =>
  ({ actor }: DialogueContext): boolean =>
    actor.id === speakerId;

const createEntry = (
  priority: number,
  text: string,
  condition: DialogueEntry["condition"],
  result: DialogueEntry["result"] = noOpResult,
): DialogueEntry => ({ condition, priority, result, text });

const dialogues: DialogueRecordSet = {
  greetings: {
    greeting_0: {
      dialogueType: DIALOGUE_TYPE.GREETING,
      id: "Greeting 0",
      info: [
        createEntry(
          100,
          'Jiub grins wearily. "Jiub. Last I checked, anyway. Better get moving before they decide to keep us both down here."',
          matchSpeaker("jiub"),
        ),
        createEntry(
          90,
          "The guard eyes you for a moment. \"If you're meant to be processed, don't waste time standing around.\"",
          matchSpeaker("Imperial Guard"),
        ),
        createEntry(
          80,
          'Socucius Ergalla shuffles a stack of papers. "State your business and we\'ll see you sorted."',
          matchSpeaker("chargen class"),
        ),
        createEntry(
          80,
          "Sellus Gravius looks up from his desk. \"If you're here for your release, let's make this brief.\"",
          matchSpeaker("chargen captain"),
        ),
      ],
      objectType: OBJECT_TYPE.DIALOGUE,
    },
  },
  topics: {
    "Who are you?": {
      dialogueType: DIALOGUE_TYPE.TOPIC,
      id: "Who are you?",
      info: [
        createEntry(
          100,
          'Jiub grins wearily. "Jiub. Last I checked, anyway. Better get moving before they decide to keep us both down here."',
          matchSpeaker("jiub"),
        ),
      ],
      objectType: OBJECT_TYPE.DIALOGUE,
    },
    "Where are we?": {
      dialogueType: DIALOGUE_TYPE.TOPIC,
      id: "Where are we?",
      info: [
        createEntry(
          100,
          "\"On an Imperial prison ship. We've made port at Seyda Neen, on Vvardenfell. If this is your lucky day, you'll be off these boards soon.\"",
          matchSpeaker("jiub"),
        ),
      ],
      objectType: OBJECT_TYPE.DIALOGUE,
    },
    "I'm ready to get up.": {
      dialogueType: DIALOGUE_TYPE.TOPIC,
      id: "I'm ready to get up.",
      info: [
        createEntry(
          100,
          "Jiub steps aside and nods toward the stairs leading up to the deck.",
          matchSpeaker("jiub"),
          exitDialogue,
        ),
      ],
      objectType: OBJECT_TYPE.DIALOGUE,
    },
    "Where should I go?": {
      dialogueType: DIALOGUE_TYPE.TOPIC,
      id: "Where should I go?",
      info: [
        createEntry(
          100,
          "The guard gestures toward the nearby office. \"Report to the Census and Excise Office if you're meant to be processed. Don't loiter on the dock.\"",
          matchSpeaker("Imperial Guard"),
        ),
      ],
      objectType: OBJECT_TYPE.DIALOGUE,
    },
    "I'm just passing through.": {
      dialogueType: DIALOGUE_TYPE.TOPIC,
      id: "I'm just passing through.",
      info: [
        createEntry(
          100,
          '"Then move along. Seyda Neen is quiet, and we\'d like to keep it that way."',
          matchSpeaker("Imperial Guard"),
          exitDialogue,
        ),
      ],
      objectType: OBJECT_TYPE.DIALOGUE,
    },
    "I'm here for processing.": {
      dialogueType: DIALOGUE_TYPE.TOPIC,
      id: "I'm here for processing.",
      info: [
        createEntry(
          100,
          'Socucius Ergalla adjusts his papers. "Ah yes. Fresh off the boat. Everything seems to be in order. Speak to Sellus Gravius for your release papers."',
          matchSpeaker("chargen class"),
        ),
      ],
      objectType: OBJECT_TYPE.DIALOGUE,
    },
    "Tell me about Seyda Neen.": {
      dialogueType: DIALOGUE_TYPE.TOPIC,
      id: "Tell me about Seyda Neen.",
      info: [
        createEntry(
          100,
          '"Small town. Mudcrabs, marshes, and Imperial paperwork. If you have business elsewhere, Balmora is where your road truly begins."',
          matchSpeaker("chargen class"),
        ),
      ],
      objectType: OBJECT_TYPE.DIALOGUE,
    },
    "I'm ready for my release papers.": {
      dialogueType: DIALOGUE_TYPE.TOPIC,
      id: "I'm ready for my release papers.",
      info: [
        createEntry(
          100,
          "Sellus Gravius reaches for the release papers on his desk.",
          matchSpeaker("chargen captain"),
          ({ player, reference, actor }) => {
            const hasAlreadyBeenReleased = hasStartedQuest("Report to Caius Cosades");
            if (!hasAlreadyBeenReleased) {
              player.inventory.addItem(GOLD_ID, 87);
              player.inventory.addItem("common_shirt", 1);
              player.inventory.addItem("common_pants", 1);
              player.inventory.addItem("common_shoes", 1);
              player.inventory.addItem("directions_to_caius_cosades", 1);
              player.inventory.addItem("package_for_caius_cosades", 1);

              const quest = startQuest("Report to Caius Cosades");
              if (quest) {
                console.log(
                  "Sellus Gravius hands over your release papers, a sealed package, and a few coins.",
                );
                console.log('Quest started: "Report to Caius Cosades"');
              }
            } else {
              console.log(
                '"I\'ve already given you your papers. Take them to Caius Cosades in Balmora."',
              );
            }

            console.log(
              '"This package came with the Emperor\'s private instructions. Deliver it to Caius Cosades in Balmora, and do not lose it."',
            );

            return exitDialogue({ actor, player, reference });
          },
        ),
      ],
      objectType: OBJECT_TYPE.DIALOGUE,
    },
    "What am I supposed to do now?": {
      dialogueType: DIALOGUE_TYPE.TOPIC,
      id: "What am I supposed to do now?",
      info: [
        createEntry(
          200,
          '"Go to Balmora. Find Caius Cosades. Give him the package and the directions note. That\'s all you need to know for now."',
          ({ actor }) =>
            actor.id === "chargen captain" && hasStartedQuest("Report to Caius Cosades"),
        ),
        createEntry(
          100,
          '"First, let me finish your release. Then we\'ll discuss your orders."',
          matchSpeaker("chargen captain"),
        ),
      ],
      objectType: OBJECT_TYPE.DIALOGUE,
    },
  },
};

export default dialogues;
