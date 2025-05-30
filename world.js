export const locations = {
    town: {
        name: 'Havenwood',
        description: 'A bustling town with a marketplace and inn.',
        quests: ['investigate_ruins'],
        npcs: ['blacksmith', 'innkeeper']
    },
    temple: {
        name: 'Temple of Light',
        description: 'A serene place of worship with healing energy.',
        npcs: ['priestess'],
    },
    forest: {
        name: 'Darkwood Forest',
        description: 'A dense forest teeming with goblins.',
        quests: ['slay_goblins'],
        npcs: ['hermit', 'forest_warden'],
        lootTable: 'forest',
        enemies: ['goblin', 'goblin', 'goblin', 'goblin_shaman'], // 3:1 spawn ratio
    },
    ruins: {
        name: 'Ancient Ruins',
        description: 'Crumbling stone structures covered in vines. An eerie silence hangs in the air.',
        enemies: ['skeleton', 'stone_golem', 'void_cultist'],
        special: 'artifact_chamber',
        lootTable: 'ruins',
        npcs: []
    }
};
