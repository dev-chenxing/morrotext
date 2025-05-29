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

// quest definition
export const QUESTS = {
  investigate_ruins: {
    title: "Investigate the Ancient Ruins",
    objectives: [
      { type: "collect", item: "crown_of_widsom", count: 1, description: 'Retrieve the Ancient Artifact from the ruins', },
      { type: "return", target: "town", description: 'Return to the Hermit with the artifact', }
    ],
    reward: { gold: 200 }
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
