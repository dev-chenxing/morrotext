import type { Reference } from "../types.ts";
import { JOURNAL } from "./quests.ts";

export type DialogueRegistryEntry = { id: string; info: DialogueInfoRegistryEntry[] };

export type DialogueInfoRegistryEntry = {
  actor?: string;
  condition?: () => boolean;
  text: string;
  runScript?: (reference: Reference) => void;
};

const GREETING: DialogueRegistryEntry[] = [
  {
    id: "Greeting 1",
    info: [
      {
        actor: "chargen captain",
        condition: () => mt.getItemCount(mt.player, "chargen statssheet") >= 1,
        text: "First, let me take your identification papers. Thank you. Word of your arrival only reached me yesterday. I am %name. But my background is not important. I'm here to welcome you to Morrowind.",
        runScript: (reference: Reference) => {
          mt.removeItem(mt.player, "chargen statssheet", 1);
          reference.data.state = -1;
        },
      },
    ],
  },
];

const TOPIC: DialogueRegistryEntry[] = [
  {
    id: "Background",
    info: [{ actor: "chargen captain", text: "I am %name, and %rank of the %faction." }],
  },
  {
    id: "duties",
    info: [
      {
        actor: "chargen captain",
        condition: () => {
          const journalIndex = mt.getJournalIndex("A1_1_FindSpymaster") ?? 0;
          return journalIndex < 12 && journalIndex >= 1;
        },
        // Note: journal gets set to 12 when you give spymaster package.
        text: "You know your duties. Take that package to Caius Cosades in Balmora.",
      },
      {
        actor: "chargen captain",
        condition: () => (mt.getJournalIndex("A1_1_FindSpymaster") ?? 0) === 0,
        // Note: journal gets set to 12 when you give spymaster package.
        text: "This package came with the news of your arrival. You are to take it to Caius Cosades, in the town of Balmora. Go to the South Wall Cornerclub, and ask for Caius Cosades -- they'll know where to find him. Serve him as you would serve the Emperor himself. I also have a letter for you, and a disbursal to your name.",
        runScript: () => {
          mt.updateJournal("A1_1_FindSpymaster", 1);
          mt.addItem(mt.player, "bk_A1_1_DirectionsCaiusCosades", 1);
          mt.addItem(mt.player, "bk_a1_1_caiuspackage", 1);
          mt.addItem(mt.player, "Gold_001", 87);
          mt.addTopic("Caius Cosades");
          mt.addTopic("South Wall");
          mt.addTopic("specific place");
          mt.addTopic("someone in particular");
          mt.addTopic("services");
          mt.addTopic("my trade");
          mt.addTopic("little secret");
          mt.addTopic("latest rumors");
          mt.addTopic("little advice");
        },
      },
    ],
  },
  {
    id: "Morrowind",
    info: [
      {
        actor: "chargen captain",
        text: "Yes. You're in Morrowind. I don't know why you're here. Or why you were released from prison and shipped here. But your authorization comes directly from Emperor Uriel Septim VII himself. And I don't need to know any more than that. When you leave this office, you are a free man. But before you go, I have instructions on your duties. Instructions from the Emperor. So pay careful attention.",
      },
    ],
  },
];

export const DIALOGUE = { TOPIC, GREETING, JOURNAL };
