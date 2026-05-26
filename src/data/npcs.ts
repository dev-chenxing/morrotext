export type NPCRegistryEntry = {
  id: string;
  name: string;
  level?: number;
  classId: string;
  inventory?: Record<string, number>;
  description?: string;
};

export const NPC_REGISTRY: NPCRegistryEntry[] = [
  {
    id: "smith",
    name: "Smith",
    level: 1,
    classId: "smith",
    inventory: {
      steel_sword: -1,
    },
    description: "A skilled blacksmith.",
  },
  {
    id: "publican",
    name: "Publican",
    level: 1,
    classId: "publican",
    inventory: {
      health_potion: -5,
      mana_potion: -5,
    },
    description: "A friendly publican.",
  },
];
