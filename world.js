export const locations = {
    town: {
        name: 'Havenwood',
        description: 'A bustling town with a marketplace and inn.',
        quests: ['investigate_ruins'],
        npcs: ['blacksmith', 'innkeeper']
    },
    forest: {
        name: 'Darkwood Forest',
        description: 'A dense forest teeming with goblins.',
        quests: ['slay_goblins'],
        npcs: ['hermit', 'forest_warden'],
        enemies: ['goblin', 'goblin', 'goblin', 'goblin_shaman'], // 3:1 spawn ratio
    }
};
