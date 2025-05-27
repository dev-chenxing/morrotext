import { ITEMS } from './items.js';

export function startQuest(player, questKey) {
    if (player.activeQuests.some(q => q.key === questKey)) {
        return console.log('Quest already in progress!');
    }

    const quest = {
        key: questKey,
        ...QUESTS[questKey],
        progress: 0,
        completed: false
    };
    console.log(quest)

    player.activeQuests.push(quest);
    console.log(`New quest started: "${quest.title}"`);
}

// quest definition
export const QUESTS = {
    investigate_ruins: {
        title: 'Investigate the Ancient Ruins',
        objectives: [
            { type: 'talk', target: 'hermit' },
            { type: 'collect', item: 'ancient_artifact', count: 1 },
            { type: 'return', target: 'town' }
        ],
        reward: { gold: 200, items: [ITEMS.ancient_relic] }
    },
    slay_goblins: {
        title: 'Goblin Infestation',
        objectives: [
            { type: 'kill', enemy: 'goblin', count: 5 },
            { type: 'loot', item: 'goblin_ear', count: 3 },
            { type: 'report', npc: 'forest_warden' }
        ],
        reward: {
            gold: 150,
            items: ['steel_dagger'],
            exp: 500
        }
    }
};