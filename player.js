import { CLASSES } from './classes.js';

export class Player {
    constructor(name, className) {
        this.name = name;
        this.level = 1;

        this.class = className;
        Object.assign(this, CLASSES[className].stats);
        this.inventory = [...CLASSES[className].startingItems];

        this.gold = 50;
        this.activeQuests = [];
        this.equipment = {
            weapon: null,
            armor: null
        };
    }

    // Cleric-specific method
    divineHeal() {
        const { manaCost, healMultiplier } = CLASSES.cleric.abilities.divineHeal;

        if (this.mana >= manaCost) {
            this.mana -= manaCost;
            const healAmount = Math.min(this.magic * healMultiplier, this.maxHp - this.hp);
            this.hp += healAmount;

            console.log(chalk.yellow(`Divine healing restored ${healAmount} HP!`));
            return healAmount;
        }

        console.log(chalk.red("Not enough mana for healing!"));
        return 0;
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