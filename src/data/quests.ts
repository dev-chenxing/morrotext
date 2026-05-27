export type QuestRegistryEntry = {
  id: string;
  dialogue: { id: string; info: { text: string; journalIndex: number }[] }[];
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
