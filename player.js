import chalk from "chalk";
import { CLASSES, EXP_LEVELS } from "./classes.js";
import { ITEMS } from "./items.js";

export class Player {
  constructor(name, className) {
    this.name = name;

    this.exp = 0;
    this.level = 1;

    this.class = className;
    Object.assign(this, CLASSES[className].stats);
    this.maxHp = this.hp;

    this.equipment = {
      weapon: null,
      armor: null
    };
    this.inventory = [...CLASSES[className].startingItems];

    // Auto-equip starting items
    this.inventory.forEach(itemId => {
      const item = ITEMS[itemId];
      if (item.type === "weapon") this.equipItem(item);
      if (item.type === "armor") this.equipItem(item);
    });

    this.gold = 50;
    this.activeQuests = [];
  }

  addExp(amount) {
    this.exp += amount;
    while (this.exp >= EXP_LEVELS[this.level]) {
      this.levelUp();
    }
  }

  levelUp() {
    this.level++;
    this.maxHp += 20;
    this.hp = this.maxHp;
    console.log(chalk.yellow(`\n=== LEVEL UP! (${this.level}) ===`));
    console.log(`Max HP increased to ${this.maxHp}`);
  }

  // Mage-specific method
  castFireball() {
    const { manaCost, damageMultiplier } = CLASSES.mage.abilities.fireball;
    if (this.mana >= manaCost) {
      this.mana -= manaCost;
      return Math.floor(this.magic * damageMultiplier);
    }
    return 0;
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
    try {
      if (item.type === "weapon") {
        if (this.equipment.weapon) this.unequipItem(this.equipment.weapon);
        this.equipment.weapon = item;
        this.applyItemStats(item);

        console.log(chalk.green(`Equipped ${item.name}!`));
      } else if (item.type === "armor") {
        if (this.equipment.armor) this.unequipItem(this.equipment.armor);
        this.equipment.armor = item;
        this.applyItemStats(item);

        console.log(chalk.green(`Equipped ${item.name}!`));
      }
    } catch (error) {
      console.log(chalk.red(`Cannot equip ${item.name}: ${error.message}`));
    }
  }

  unequipItem(item) {
    this.removeItemStats(item);
    console.log(chalk.yellow(`Unequipped ${item.name}`));
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
