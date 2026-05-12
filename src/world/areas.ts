import type { Player } from "../actors/Player.ts";
import type { Area } from "../types.ts";

export const areas: Record<string, Area> = {
  town: {
    name: "Havenwood",
    description: "A bustling town with a marketplace and inn.",
    quests: ["investigate_ruins"],
    npcs: ["smith", "publican"],
  },
  temple: {
    name: "Temple of Light",
    description: "A serene place of worship with healing energy.",
    npcs: ["priestess"],
  },
  forest: {
    name: "Darkwood Forest",
    description: (player: Player) => {
      if (player.completedQuests.some((q) => q.key === "slay_goblins")) {
        return "The forest is peaceful now, with goblins driven out by your efforts.";
      }
      return "A dense forest teeming with monsters. Goblin signs are everywhere.";
    },
    quests: ["slay_goblins"],
    npcs: ["hermit", "forest_warden"],
    lootTable: "forest",
    enemies: (player: Player) => {
      if (player.completedQuests.some((q) => q.key === "slay_goblins")) {
        return ["wolf", "forest_spider"]; // New peaceful creatures
      }
      return ["goblin", "goblin", "goblin", "goblin_shaman"]; // 3:1 spawn ratio
    },
  },
  ruins: {
    name: "Ancient Ruins",
    description:
      "Crumbling stone structures covered in vines. An eerie silence hangs in the air.",
    enemies: ["skeleton", "stone_golem", "void_cultist"],
    lootTable: "ruins",
    npcs: [],
    // Access requires quest acceptance
    travelCondition: (player: Player) => {
      return player.activeQuests.some((q) => q.key === "investigate_ruins");
    },
  },
};
