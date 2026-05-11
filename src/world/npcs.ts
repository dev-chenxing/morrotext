// NPC registry entries.
// Consumers should resolve full `NPC` instances by merging registry data
// with runtime defaults.
export type NPCEntry = {
  id: string;
  name?: string;
  level?: number;
  inventory?: Record<string, number>;
  classId?: string;
};

export const NPCS: NPCEntry[] = [
  {
    id: "smith",
    name: "Smith",
    level: 1,
    classId: "smith",
    inventory: {
      iron_helmet: 999,
      steel_sword: 999,
    },
  },
  {
    id: "publican",
    name: "Publican",
    level: 1,
    classId: "publican",
    inventory: {
      health_potion: 999,
      mana_potion: 999,
    },
  },
];

export default NPCS;
