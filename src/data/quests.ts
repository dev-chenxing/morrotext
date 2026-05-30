export type QuestRegistryEntry = {
  id: string;
  dialogue: { id: string; questName: string; info: { text: string; journalIndex: number }[] }[];
};

export const JOURNAL: QuestRegistryEntry[] = [
  {
    id: "Report to Caius Cosades",
    dialogue: [
      {
        id: "A1_1_FindSpymaster",
        questName: "Report to Caius Cosades",
        info: [
          {
            journalIndex: 1,
            text: "My orders are to go to the town of Balmora in Vvardenfell District and report to a man named Caius Cosades. To find out where he lives, I should ask in Balmora at the cornerclub called South Wall. When I find Caius Cosades, I must give him a package of documents, and wait for further orders.",
          },
          {
            journalIndex: 2,
            text: "Elone at Arrille's Tradehouse gave me detailed directions to Balmora.",
          },
          {
            journalIndex: 5,
            text: 'A patron of the South Wall cornerclub called Caius Cosades "an old sugar tooth," and says to ask the owner, Bacola Closcius, about Caius Cosades.',
          },
          {
            journalIndex: 10,
            text: "Bacola Closcius says Caius Cosades rents a little bed-and-basket up the hill from the South Wall. Go right up the stairs from the front door, then left at the top of the stairs and down to the end of the street.",
          },
          {
            journalIndex: 11,
            text: "I reported to Caius Cosades, but I haven't given him the package of documents yet.",
          },
          {
            journalIndex: 12,
            text: "I gave Caius Cosades the package of documents. Caius Cosades says the Emperor wants me inducted into the Blades, the Imperial Intelligence service, with the rank of Novice. Caius Cosades would be my Spymaster, and I would follow his orders. Should I do as the Emperor commands? I'm not sure... I want to think about it.",
          },
          {
            journalIndex: 14,
            text: "I have given Caius Cosades the package of documents. And, by the Emperor's command, Caius Cosades has inducted me into the Blades, the Imperial Intelligence service, with the rank of Novice. Caius Cosades will be my Spymaster, and I'll follow his orders.",
          },
          {
            journalIndex: 18,
            text: "Spymaster Caius Cosades gave me 200 gold to spend as I please. And he also told me to establish a cover identity as a freelance adventurer. He suggested I join the Fighters Guild, or Mages Guild, or Imperial cult, advance in the ranks, gain skill and experience, or go out on my own, get freelance work. Then, when I'm ready, I come back to Caius for orders.",
          },
          {
            journalIndex: 20,
            text: "Spymaster Caius Cosades told me to establish a cover identity as a freelance adventurer. He suggested I might find some work at the Fighters Guild and the Mages Guild. When I'm ready, I'm to come back to him, and he'll have orders for me.",
          },
          {
            journalIndex: 22,
            text: "Spymaster Caius Cosades suggested I maintain a cover identity as a freelance adventurer, just to avoid drawing unwanted attention. And he says he has orders for me, whenever I'm ready.",
          },
        ],
      },
    ],
  },
];
