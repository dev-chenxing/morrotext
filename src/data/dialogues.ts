import type { Dialogue } from "../types.ts";
import { GOLD_ID, OBJECT_TYPE } from "../constants.ts";
import { barter } from "../core/systems/barter.ts";
import { startQuest, completeQuest, hasStartedQuest } from "../data/quests.ts";
import { game } from "../core/gameState.ts";

const npcDialogues: Record<string, Dialogue> = {
  smith: {
    id: "smith",
    objectType: OBJECT_TYPE.DIALOGUE,
    info: [
      {
        text: "Browse weapons and armor",
        runScript: async (ref) => {
          const actor = ref.object as any;
          const player = game.player;
          if (!player) {
            (ref.tempData as any).__dialogue_exit = true;
            return;
          }
          await barter(player, actor);
        },
      },
      {
        text: "Ask about special orders",
        runScript: () => {
          console.log("The smith asks for rare Void Essence to craft special weapons.");
        },
      },
      {
        text: "I'll gather the materials",
        runScript: (ref) => {
          const player = game.player;
          if (!player) {
            (ref.tempData as any).__dialogue_exit = true;
            return;
          }
          const quest = startQuest("special_orders");
          if (quest) {
            console.log(`Quest started: "special_orders"`);
            (ref.tempData as any).__dialogue_exit = true;
            return;
          }
          console.log("That quest is unavailable right now.");
        },
      },
      {
        text: "[Hand over materials] I have everything",
        runScript: (ref) => {
          const player = game.player;
          if (!player) {
            (ref.tempData as any).__dialogue_exit = true;
            return;
          }
          if (player.inventory.getItemCount("void_essence") < 5) {
            console.log("You don't have enough Void Essence.");
            return;
          }
          player.inventory.removeItem("void_essence", 5);
          completeQuest("special_orders");
          console.log("The smith forges a masterwork hammer for you.");
          (ref.tempData as any).__dialogue_exit = true;
        },
      },
      {
        text: "Leave",
        runScript: (ref) => {
          (ref.tempData as any).__dialogue_exit = true;
        },
      },
    ],
  },

  publican: {
    id: "publican",
    objectType: OBJECT_TYPE.DIALOGUE,
    info: [
      {
        text: "Rest for the night (10 gold)",
        runScript: (ref) => {
          const player = game.player;
          if (!player) {
            (ref.tempData as any).__dialogue_exit = true;
            return;
          }
          const cost = 10;
          if (player.inventory.getItemCount(GOLD_ID) >= cost) {
            player.inventory.removeItem(GOLD_ID, cost);
            player.health.current = player.health.base;
            player.magicka.current = player.magicka.base;
            console.log("You rest and recover fully.");
            (ref.tempData as any).__dialogue_exit = true;
            return;
          }
          console.log("Not enough gold for a room!");
        },
      },
      {
        text: "Buy supplies",
        runScript: async (ref) => {
          const actor = ref.object as any;
          const player = game.player;
          if (!player) {
            (ref.tempData as any).__dialogue_exit = true;
            return;
          }
          await barter(player, actor);
        },
      },
      {
        text: "Hear local rumors",
        runScript: () => {
          console.log("They say the ancient ruins north of town hold powerful artifacts.");
        },
      },
      {
        text: "Return to tavern hall",
        runScript: (ref) => {
          (ref.tempData as any).__dialogue_exit = true;
        },
      },
    ],
  },

  hermit: {
    id: "hermit",
    objectType: OBJECT_TYPE.DIALOGUE,
    info: [
      {
        text: "I've retrieved the ancient artifact",
        runScript: (ref) => {
          const player = game.player;
          if (!player) {
            (ref.tempData as any).__dialogue_exit = true;
            return;
          }
          if (!player.inventory.getItemCount("crown_of_wisdom")) {
            console.log("You don't have the required item!");
            (ref.tempData as any).__dialogue_exit = true;
            return;
          }
          player.inventory.removeItem("crown_of_wisdom", 1);
          console.log("The Hermit places the artifact in the town vault.");
          completeQuest("investigate_ruins");
          (ref.tempData as any).__dialogue_exit = true;
        },
      },
      {
        text: "I found this ancient tablet",
        runScript: (ref) => {
          const player = game.player;
          if (!player) {
            (ref.tempData as any).__dialogue_exit = true;
            return;
          }
          if (player.inventory.getItemCount("ancient_tablet") === 0) {
            console.log("You don't have a tablet.");
            return;
          }
          console.log("The tablet speaks of a hidden passage behind the throne.");
        },
      },
      {
        text: "Accept quest",
        runScript: (ref) => {
          const player = game.player;
          if (!player) {
            (ref.tempData as any).__dialogue_exit = true;
            return;
          }
          const quest = startQuest("investigate_ruins");
          if (quest) {
            console.log(`Quest started: "investigate_ruins"`);
            (ref.tempData as any).__dialogue_exit = true;
            return;
          }
          console.log("That quest is unavailable right now.");
        },
      },
      {
        text: "Maybe later",
        runScript: (ref) => {
          (ref.tempData as any).__dialogue_exit = true;
        },
      },
    ],
  },

  priestess: {
    id: "priestess",
    objectType: OBJECT_TYPE.DIALOGUE,
    info: [
      {
        text: "Receive blessing (50 gold)",
        runScript: (ref) => {
          const player = game.player;
          if (!player) {
            (ref.tempData as any).__dialogue_exit = true;
            return;
          }
          const cost = 50;
          if (player.inventory.getItemCount(GOLD_ID) >= cost) {
            player.inventory.removeItem(GOLD_ID, cost);
            player.health.current = Math.min(player.health.base, player.health.current + 10);
            player.magicka.current = Math.min(player.magicka.base, player.magicka.current + 10);
            (ref.tempData as any).__dialogue_exit = true;
            return;
          }
          console.log("Not enough gold for blessing!");
        },
      },
      {
        text: "Learn holy prayer",
        runScript: (ref) => {
          console.log("You learn a simple prayer.");
          (ref.tempData as any).__dialogue_exit = true;
        },
      },
      {
        text: "Seek guidance",
        runScript: () => {
          console.log("Darkness gathers in the ancient ruins.");
        },
      },
      {
        text: "Leave",
        runScript: (ref) => {
          (ref.tempData as any).__dialogue_exit = true;
        },
      },
    ],
  },

  forest_warden: {
    id: "forest_warden",
    objectType: OBJECT_TYPE.DIALOGUE,
    info: [
      {
        text: "I've cleared the goblins",
        runScript: (ref) => {
          const player = game.player;
          if (!player) {
            (ref.tempData as any).__dialogue_exit = true;
            return;
          }
          if (!hasStartedQuest("slay_goblins") || player.inventory.getItemCount("goblin_ear") < 5) {
            console.log("You haven't completed the requirements.");
            return;
          }
          player.inventory.removeItem("goblin_ear", 5);
          completeQuest("slay_goblins");
          console.log("You've done us a great service!");
          (ref.tempData as any).__dialogue_exit = true;
        },
      },
      {
        text: "I'll clear the infestation",
        runScript: (ref) => {
          const player = game.player;
          if (!player) {
            (ref.tempData as any).__dialogue_exit = true;
            return;
          }
          const quest = startQuest("slay_goblins");
          if (quest) {
            console.log(`Quest started: "slay_goblins"`);
            (ref.tempData as any).__dialogue_exit = true;
            return;
          }
          console.log("That quest is unavailable right now.");
        },
      },
      {
        text: "Leave",
        runScript: (ref) => {
          (ref.tempData as any).__dialogue_exit = true;
        },
      },
    ],
  },
};

export default npcDialogues;
