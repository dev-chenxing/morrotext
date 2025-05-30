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

export function completeQuest(player, questKey) {
  const questIndex = player.activeQuests.findIndex(q => q.key === questKey);
  if (questIndex === -1) return;

  const quest = player.activeQuests[questIndex];
  const questData = QUESTS[questKey];

  // Apply rewards
  player.gold += questData.reward.gold;
  player.addExp(questData.reward.exp);
  questData.reward.items?.forEach(itemId => {
    player.inventory.addItem(itemId);
  });

  // Remove quest from active list
  player.activeQuests.splice(questIndex, 1);

  console.log(chalk.green(`\nQuest "${quest.title}" completed!`));
  console.log(`Rewards: ${questData.reward.gold} gold, ${questData.reward.exp} EXP`);
  if (questData.reward.items.length > 0) {
    console.log(`Items: ${questData.reward.items.map(id => ITEMS[id].name).join(', ')}`);
  }
}

// quest definition
export const QUESTS = {
  investigate_ruins: {
    title: "Investigate the Ancient Ruins",
    objectives: [
      { type: "collect", item: "crown_of_widsom", count: 1, description: 'Retrieve the Ancient Artifact from the ruins', },
      { type: "return", target: "town", description: 'Return to the Hermit with the artifact', }
    ],
    reward: { gold: 500, exp: 1000 }
  },
  slay_goblins: {
    title: "Goblin Infestation",
    objectives: [
      { type: "loot", item: "goblin_ear", count: 3, description: 'Slay the goblins in Darkwood Forest and collect 3 goblin ears as proof', },
      { type: "report", npc: "forest_warden", description: 'Report to Ranger Alden', }
    ],
    reward: {
      gold: 150,
      items: ["steel_dagger"],
      exp: 500
    }
  }
};
