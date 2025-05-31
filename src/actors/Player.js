import chalk from "chalk";
import { CLASSES } from "../classes.js";
import { EXP_LEVELS } from "../utils/expLevels.js";
import { ITEMS } from "../items.js";
import { EFFECTS } from '../effects.js';

export class Player {
  constructor(name, className) {
    this.name = name;

    this.exp = 0;
    this.level = 1;

    this.class = className;
    Object.assign(this, CLASSES[className].stats);
    this.hp = this.maxHp;
    this.maxMana = CLASSES[className].stats.maxMana || 0;
    this.mana = this.maxMana;

    this.luck = CLASSES[className].stats.luck || 5;

    this.activeEffects = [];

    this.equipment = {
      weapon: null,
      armor: null,
      accessory: null
    };
    this.inventory = {}; // {itemId: count}
    this.addStartingItems();

    this.gold = 50;

    this.activeQuests = [];
    this.completedQuests = [];
    this.storyFlags = {};

    this.killCount = {};
  }

  recordKill(enemyType) {
    if (!this.killCount[enemyType]) this.killCount[enemyType] = 0;
    this.killCount[enemyType]++;
  }

  applyEffect(effectId) {
    const effect = EFFECTS[effectId];
    if (!effect) return false;

    // Check for existing effect of same type
    const existingIndex = this.activeEffects.findIndex(e => e.id === effectId);

    // Remove existing effect first
    if (existingIndex !== -1) {
      const existing = this.activeEffects[existingIndex];

      // Remove stat boosts
      if (existing.stats) {
        Object.entries(existing.stats).forEach(([stat, value]) => {
          this[stat] -= value;
        });
      }

      // Cancel expiration timer
      clearTimeout(existing.timerId);

      // Remove from array
      this.activeEffects.splice(existingIndex, 1);

      console.log(chalk.yellow("\nExisting blessing removed before applying new one."));
    }

    // Apply effect new stat boosts
    if (effect.stats) {
      Object.entries(effect.stats).forEach(([stat, value]) => {
        this[stat] += value;
      });
    }

    // Set expiration
    const effectClone = { ...effect };
    effectClone.expiresAt = Date.now() + (effect.duration * 1000);
    this.activeEffects.push(effectClone);

    // Trigger callback
    if (effect.onApply) effect.onApply(this);

    console.log(chalk.yellow(`\n${effect.name} applied!`));

    return true;
  }

  updateEffects() {
    const now = Date.now();
    this.activeEffects = this.activeEffects.filter(effect => {
      if (effect.expiresAt <= now) {
        // Remove effect stats
        if (effect.stats) {
          Object.entries(effect.stats).forEach(([stat, value]) => {
            this[stat] -= value;
          });
        }

        // Trigger expiration callback
        if (effect.onExpire) effect.onExpire(this);

        console.log(chalk.yellow(`\n${effect.name} has worn off.`));
        return false;
      }
      return true;
    });
  }

  addStartingItems() {
    const startingItems = CLASSES[this.class].startingItems;
    startingItems.forEach(itemId => {
      this.addItem(itemId);

      // Auto-equip weapons and armor
      const item = ITEMS[itemId];
      if (item.type === 'weapon' || item.type === 'armor') {
        this.equipItem(item);
      }
    });
  }

  addItem(itemId, count = 1) {
    if (!ITEMS[itemId]) {
      console.error(chalk.red(`[WARNING] Tried to add invalid item: ${itemId}`));
      return false;
    }
    if (!this.inventory[itemId]) this.inventory[itemId] = 0;
    this.inventory[itemId] += count;

    return true;
  }

  removeItem(itemId, count = 1) {
    if (!this.inventory[itemId] || this.inventory[itemId] < count) {
      return false;
    }
    this.inventory[itemId] -= count;
    if (this.inventory[itemId] <= 0) {
      delete this.inventory[itemId];
    }
    return true;
  }

  hasItem(itemId) {
    return !!this.inventory[itemId] && this.inventory[itemId] > 0;
  }

  getInventoryCount(itemId) {
    return this.inventory[itemId] || 0;
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
    console.log(chalk.red("Not enough mana!"));
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

  isItemEquipped(itemId) {
    return (
      this.equipment.weapon?.id === itemId ||
      this.equipment.armor?.id === itemId ||
      this.equipment.accessory?.id === itemId
    );
  }

  unequipItemById(itemId) {
    if (this.equipment.weapon?.id === itemId) {
      this.unequipItem(this.equipment.weapon);
    } else if (this.equipment.armor?.id === itemId) {
      this.unequipItem(this.equipment.armor);
    } else if (this.equipment.accessory?.id === itemId) {
      this.unequipItem(this.equipment.accessory);
    }
  }

  equipItem(item) {
    try {

      switch (item.type) {
        case 'weapon':
          if (this.equipment.weapon) this.unequipItem(this.equipment.weapon);
          this.equipment.weapon = item;
          this.applyItemStats(item);

          console.log(chalk.green(`Equipped ${item.name}!`));
          break;
        case 'armor':
          if (this.equipment.armor) this.unequipItem(this.equipment.armor);
          this.equipment.armor = item;
          this.applyItemStats(item);

          console.log(chalk.green(`Equipped ${item.name}!`));
          break;
        case 'accessory':
          if (this.equipment.accessory) this.unequipItem(this.equipment.accessory);
          this.equipment.accessory = item;
          this.applyItemStats(item);
          console.log(chalk.green(`Equipped ${item.name} in accessory slot!`));
          break;
      }

    } catch (error) {
      console.log(chalk.red(`Cannot equip ${item.name}: ${error.message}`));
    }
  }

  unequipItem(item) {
    this.removeItemStats(item);

    switch (item.type) {
      case 'weapon':
        this.equipment.weapon = null;
        break
      case 'armor':
        this.equipment.armor = null;
        break
      case 'accessory':
        this.equipment.accessory = null;
        break;
    }

    console.log(chalk.yellow(`Unequipped ${item.name}`));
  }

  applyItemStats(item) {
    if (item.stats) {
      Object.entries(item.stats).forEach(([stat, value]) => {
        // Handle HP boosts specially
        if (stat === 'maxHp') {
          const oldMax = this.maxHp;
          this.maxHp += value;

          // Preserve HP percentage when max HP changes
          const hpPercent = this.hp / oldMax;
          this.hp = Math.max(1, Math.floor(this.maxHp * hpPercent));
        } else {
          this[stat] += value;
        }
      });
    }
  }

  removeItemStats(item) {
    if (item.stats) {
      Object.entries(item.stats).forEach(([stat, value]) => {
        if (stat === 'maxHp') {
          const oldMax = this.maxHp;
          this.maxHp -= value;

          // Preserve HP percentage when max HP changes
          const hpPercent = this.hp / oldMax;
          this.hp = Math.max(1, Math.floor(this.maxHp * hpPercent));
        } else {
          this[stat] -= value;
        }
      });
    }
  }
}
