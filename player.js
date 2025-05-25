export class Player {
    constructor(name, className) {
        this.name = name;
        this.class = className;
        this.level = 1;
        this.maxHp = 100;
        this.hp = 100;
        this.gold = 50;
        this.inventory = [];
        this.activeQuests = [];
        this.equipment = {
            weapon: null,
            armor: null
        };
        this.setClassStats();
    }

    setClassStats() {
        const classes = {
            warrior: { attack: 15, defense: 10 },
            mage: { attack: 20, defense: 5 },
            rogue: { attack: 12, defense: 8 }
        };
        Object.assign(this, classes[this.class]);
    }

    equipItem(item) {
        if (item.type === 'weapon') {
            if (this.equipment.weapon) this.unequipItem(this.equipment.weapon);
            this.equipment.weapon = item;
            this.applyItemStats(item);
        }
        else if (item.type === 'armor') {
            if (this.equipment.armor) this.unequipItem(this.equipment.armor);
            this.equipment.armor = item;
            this.applyItemStats(item);
        }
    }

    unequipItem(item) {
        this.removeItemStats(item);
        // Return to inventory ?
    }

    applyItemStats(item) {
        if (item.stats) {
            Object.entries(item.stats).forEach(([stat, value]) => {
                this[stat] += value;
            });
        }
    }

    removeItemStats(item) {
        if (item.stats) {
            Object.entries(item.stats).forEach(([stat, value]) => {
                this[stat] -= value;
            });
        }
    }
}