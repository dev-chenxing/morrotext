export type QuestRegistryEntry = {
  id: string;
  dialogue: { id: string; info: { text: string; journalIndex: number }[] }[];
};

export const QUESTS: QuestRegistryEntry[] = [
  {
    id: "Report to Caius Cosades",
    dialogue: [
      {
        id: "report_to_caius_cosades",
        info: [
          {
            text: "Sellus Gravius released me from Imperial custody and ordered me to report to Caius Cosades in Balmora. I should keep the package and directions safe until I find him.",
            journalIndex: 1,
          },
        ],
      },
    ],
  },
];
