import chalk from "chalk";
import { ITEMS } from "../items.js";

export function isQuestAvailable(player, questKey) {
  // Check if already completed
  if (player.completedQuests.some(q => q.key === questKey)) {
    return false;
  }

  // Check if already active
  if (player.activeQuests.some(q => q.key === questKey)) {
    return false;
  }

  return true;
}

export function startQuest(player, questKey) {
  if (player.activeQuests.some(q => q.key === questKey)) {
    return console.log("Quest already in progress!");
  }

  const quest = {
    key: questKey,
    ...QUESTS[questKey],
    progress: 0,
    completed: false
  };
  console.log(quest);

  player.activeQuests.push(quest);
  console.log(`New quest started: "${quest.title}"`);
}

export function updateQuestProgress(player, questKey, progress, message) {
  const quest = player.activeQuests.find(q => q.key === questKey);
  if (!quest) return false;

  // Only update if progressing forward
  if (progress > quest.progress) {
    quest.progress = progress;
    console.log(chalk.green(`\n[QUEST UPDATE] ${message}`));
    return true;
  }
  return false;
}

export function completeQuest(player, questKey) {
  const questData = QUESTS[questKey];
  const quest = player.activeQuests.find(q => q.key === questKey);

  if (!quest) return;

  if (!player.completedQuests.find(q => q.key === questKey)) {
    player.completedQuests.push(quest)
  }

  // Remove quest from active list
  player.activeQuests = player.activeQuests.filter(q => q.key !== questKey);

  // Show completion message
  console.log(chalk.green(`\nQuest "${quest.title}" completed!`));
  console.log(`Rewards: ${questData.reward.gold} gold, ${questData.reward.exp} EXP`);
  if (questData.reward.items && questData.reward.items.length > 0) {
    console.log(`Items: ${questData.reward.items.map(id => ITEMS[id].name).join(', ')}`);
  }

  // Apply rewards
  player.gold += questData.reward.gold;
  player.addExp(questData.reward.exp);
  questData.reward.items?.forEach(itemId => {
    player.addItem(itemId);
  });
}

// quest definition
export const QUESTS = {
  investigate_ruins: {
    title: "Investigate the Ancient Ruins",
    objectives: [
      { type: "collect", item: "crown_of_widsom", count: 1, description: 'Retrieve the Ancient Artifact from the ruins', },
      { type: "return", target: "town", description: 'Return to the Hermit with the artifact', }
    ],
    reward: { gold: 500, exp: 500 }
  },
  slay_goblins: {
    title: "Goblin Infestation",
    objectives: [
      { type: "loot", item: "goblin_ear", count: 5, description: 'Slay the goblins in Darkwood Forest and collect 3 goblin ears as proof', },
      { type: "report", npc: "forest_warden", description: 'Report to Ranger Alden', }
    ],
    reward: {
      gold: 200,
      items: ["steel_dagger"],
      exp: 100
    }
  },
  special_order: {
    title: 'Special Orders for the Blacksmith',
    objectives: [
      {
        description: 'Obtain 5 Void Essence',
        type: 'collect',
        item: 'void_essence',
        count: 5
      },
      {
        description: 'Deliver materials to the Blacksmith',
        type: 'return',
        npc: 'blacksmith'
      }
    ],
    reward: {
      gold: 500,
      exp: 100,
      items: ['masterwork_hammer']
    }
  }
};
