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
    id: "jiub",
    name: "Jiub",
    level: 3,
    classId: "Thief",
    description: "A Dark Elf thief and fellow prisoner, alert-eyed even in the ship's dim hold.",
  },
  {
    id: "Imperial Guard",
    name: "Guard",
    level: 20,
    classId: "Guard",
    description: "An Imperial guard keeping the dock under watch.",
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
