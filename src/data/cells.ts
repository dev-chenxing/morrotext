import type { Cell } from "../types.ts";
import { hasCompletedQuest } from "./quests.ts";
export const cells: Record<string, Cell> = {
  town: {
    id: "town",
    editorName: "town",
    displayName: "Havenwood",
    description: "A bustling town with a marketplace and inn.",
    // actors will be instantiated into the `actors` ReferenceList at runtime
  },
  temple: {
    id: "temple",
    editorName: "temple",
    displayName: "Temple of Light",
    description: "A serene place of worship with healing energy.",
    // actors will be instantiated into the `actors` ReferenceList at runtime
  },
  forest: {
    id: "forest",
    editorName: "forest",
    displayName: "Darkwood Forest",
    description: () => {
      if (hasCompletedQuest("slay_goblins")) {
        return "The forest is peaceful now, with goblins driven out by your efforts.";
      }
      return "A dense forest teeming with monsters. Goblin signs are everywhere.";
    },
  },
  ruins: {
    id: "ruins",
    editorName: "ruins",
    displayName: "Ancient Ruins",
    description: "Crumbling stone structures covered in vines. An eerie silence hangs in the air.",
  },
};
