export type NPCRegistryEntry = {
  id: string;
  name: string;
  level?: number;
  classId: string;
  inventory?: Record<string, number>;
  description?: string;
};

export const NPC_REGISTRY: NPCRegistryEntry[] = [
  { id: "player", name: "Player", classId: "Thief" },
  {
    id: "chargen name",
    name: "Jiub",
    level: 3,
    classId: "Thief",
    description: "A Dark Elf thief and fellow prisoner, alert-eyed even in the ship's dim hold.",
  },
  {
    id: "chargen door guard",
    name: "Ganciele Douar",
    level: 15,
    classId: "Guard",
    description:
      "An Imperial Spearman stationed at the Census and Excise Office, overseeing prisoner processing and security.",
  },
  {
    id: "chargen class",
    name: "Socucius Ergalla",
    level: 14,
    classId: "Agent",
    description: "A weary clerk responsible for processing incoming prisoners and paperwork.",
  },
  {
    id: "chargen captain",
    name: "Sellus Gravius",
    level: 17,
    classId: "Guard",
    description: "The Imperial officer charged with your release and assignment.",
  },
];
