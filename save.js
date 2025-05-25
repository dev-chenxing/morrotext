import fs from 'fs';

export function saveGame(player) {
    const saveData = {
        ...player,
        // Add timestamp for save slots
        timestamp: new Date().toISOString()
    };
    fs.writeFileSync('save.json', JSON.stringify(saveData));
}

export function loadGame() {
    const data = fs.readFileSync('save.json');
    return JSON.parse(data);
}