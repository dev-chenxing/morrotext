import type { ActiveQuest, Dialogue } from "../types.ts";
import { isQuestAvailable } from "../world/quests.ts";

export const npcDialogues: Record<string, Dialogue> = {
  smith: {
    id: "smith",
    name: "Smith",
    dialogues: {
      initial: {
        question: "Steel and iron! What can I forge for you today?",
        options: [
          { text: "Browse weapons and armor", action: "open_shop", shop: "smith" },
          { text: "Ask about special orders", action: "special_orders" },
          { text: "Leave", action: "leave" },
        ],
      },
      special_orders: {
        question: (player) =>
          isQuestAvailable(player, "special_orders")
            ? "I need rare materials for a special commission. Can you help?"
            : "Have you brought what I need?",
        options: [
          {
            text: "I'll gather the materials",
            action: "start_quest",
            quest: "special_orders",
            condition: (player) => isQuestAvailable(player, "special_orders"),
          },
          {
            text: "[Hand over materials] I have everything",
            action: "complete_special_orders",
            condition: (player) =>
              player.activeQuests.some((quest: ActiveQuest) => quest.key === "special_orders") &&
              player.inventory.getItemCount("void_essence") >= 5,
          },
          {
            text: "I'm still gathering materials",
            action: "leave",
            condition: (player) =>
              player.activeQuests.some((quest: ActiveQuest) => quest.key === "special_orders"),
          },
          { text: "What do you need exactly?", action: "material_details" },
        ],
      },
      material_details: {
        question: "I need 5 Void Essence. You can find them in the ruins.",
        options: [
          {
            text: "I accept the task.",
            action: "start_quest",
            quest: "special_orders",
            condition: (player) => isQuestAvailable(player, "special_orders"),
          },
          {
            text: "That sounds difficult.",
            action: "leave",
            condition: (player) => isQuestAvailable(player, "special_orders"),
          },
          {
            text: "I'm still gathering materials",
            action: "leave",
            condition: (player) =>
              player.activeQuests.some((quest: ActiveQuest) => quest.key === "special_orders"),
          },
        ],
      },
      complete_special_orders: {
        question:
          "Magnificient! With these materials, I can forge weapons worthy of legends! \\\n+Take this masterwork hammer - it should serve you well.",
        options: [{ text: "Thank you", action: "complete_quest", quest: "special_orders" }],
      },
    },
  },
  publican: {
    id: "publican",
    name: "Publican",
    dialogues: {
      initial: {
        question: "Welcome to the Rusty Tankard! What'll it be?",
        options: [
          { text: "Rest for the night (10 gold)", action: "rest", cost: 10 },
          { text: "Buy supplies", action: "open_shop", shop: "general" },
          { text: "Hear local rumors", action: "rumor" },
          { text: "Return to tavern hall", action: "leave" },
        ],
      },
      rumor: {
        question:
          "They say the ancient ruins north of town hold powerful artifacts... but also terrible dangers.",
        options: [
          { text: "Tell me more about the artifact", action: "artifact_info" },
          { text: "That's enough", action: "leave" },
        ],
      },
      artifact_info: {
        question:
          "Word is the Hermit knows about such things. Strange lights come from the ruins at night...",
        options: [
          { text: "Where can I find this Hermit?", action: "hermit_area" },
          { text: "What kind of relic is it?", action: "relic_details" },
        ],
      },
      hermit_area: {
        question: "He lives in a shack deep in Darkwood Forest. But beware - the way is dangerous!",
        options: [{ text: "I'll take my chances", action: "leave" }],
      },
      relic_details: {
        question:
          "Some say it's a crown that grants wisdom, others a sword that slays dragons. Who knows?",
        options: [{ text: "Fascinating...", action: "leave" }],
      },
    },
  },
  hermit: {
    id: "hermit",
    name: "Old Hermit",
    dialogues: {
      initial: {
        question: (player) =>
          player.completedQuests.some((q: ActiveQuest) => q.key === "investigate_ruins")
            ? "The artifact is safe, thanks to you. The forest is at peace now."
            : "The ancient ruins are dangerous... but the artifact must be recovered!",
        options: [
          {
            text: "I've retrieved the ancient artifact",
            action: "return_artifact",
            condition: (player) => player.inventory.getItemCount("crown_of_wisdom") > 0,
          },
          {
            text: "I found this ancient tablet",
            action: "show_tablet",
            condition: (player) => player.inventory.getItemCount("ancient_tablet") > 0,
          },
          {
            text: "Accept quest",
            action: "start_quest",
            quest: "investigate_ruins",
            condition: (player) => isQuestAvailable(player, "investigate_ruins"),
          },
          { text: "Maybe later", action: "leave" },
        ],
      },
      show_tablet: {
        question:
          "By the old gods! Where did you find this? This tablet contains the key to the artifact chamber!",
        options: [{ text: "What does it say?", action: "translate_tablet" }],
      },
      translate_tablet: {
        question:
          "It speaks of a hidden passage behind the throne of the ancient king. The artifact lies beyond... but beware the guardians! I've marked your map with the area. The artifact is powerful, but dangerous.",
        options: [{ text: "Thank you, hermit", action: "complete_tablet" }],
      },
      return_artifact: {
        question: "By the gods! You've done it! This will help us protect our town.",
        options: [
          { text: "[Hand over artifact]", action: "complete_quest", quest: "investigate_ruins" },
        ],
      },
    },
  },
  priestess: {
    id: "priestess",
    name: "High Prietess Elara",
    dialogues: {
      initial: {
        question: "The light guides you, child. How may the church assist?",
        options: [
          { text: "Receive blessing (50 gold)", action: "blessing", cost: 50 },
          { text: "Learn holy prayer", action: "prayer" },
          { text: "Seek guidance", action: "guidance" },
          { text: "Leave", action: "leave" },
        ],
      },
      guidance: {
        question:
          "Darkness gathers in the ancient ruins. The artifact must be secured before the cultists find it.",
        options: [
          { text: "What artifact?", action: "artifact_info" },
          { text: "Who are the cultists?", action: "cultists_info" },
        ],
      },
      artifact_info: {
        question: "A relic of immense power from the First Age. It could save or doom us all.",
        options: [{ text: "I understand", action: "return" }],
      },
      cultists_info: {
        question: "Followers of the Void God. They seek to unleash ancient evils upon the world.",
        options: [{ text: "I'll stop them", action: "return" }],
      },
    },
  },
  forest_warden: {
    id: "forest_warden",
    name: "Ranger Alden",
    dialogues: {
      initial: {
        question: "The forest reeks of goblin filth. You here to help?",
        options: [
          {
            text: "I've cleared the goblins",
            action: "complete_quest",
            quest: "slay_goblins",
            condition: (player) => {
              const quest = player.activeQuests.find((q: ActiveQuest) => q.key === "slay_goblins");
              return Boolean(quest && player.inventory.getItemCount("goblin_ear") >= 5);
            },
          },
          {
            text: "I'll clear the infestation",
            action: "start_quest",
            quest: "slay_goblins",
            condition: (player) => isQuestAvailable(player, "slay_goblins"),
          },
          { text: "Leave", action: "leave" },
        ],
      },
    },
  },
};

export default npcDialogues;
