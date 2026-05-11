import chalk from "chalk";
import { CLASSES } from "../classes.ts";
import { EXP_LEVELS } from "../utils/expLevels.ts";
import { ITEMS } from "../items.ts";
import { EFFECTS } from "../effects.ts";
import type {
  ActiveEffect,
  ActiveQuest,
  Item,
  StatKey,
  Stats,
  StoryFlags,
} from "../types.ts";

function isEquipmentItem(item: Item): boolean {
  return ["weapon", "armor", "accessory"].includes(item.type);
}

export class Player implements Player {
  name: string;
  exp: number;
  level: number;
  class: string;
  attack: number;
  defense: number;
  maxHp: number;
  hp: number;
  maxMana: number;
  mana: number;
  magic: number;
  luck: number;
  activeEffects: ActiveEffect[];
  equipment: {
    weapon: Item | null;
    armor: Item | null;
    accessory: Item | null;
  };
  inventory: Record<string, number>;
  gold: number;
  activeQuests: ActiveQuest[];
  completedQuests: ActiveQuest[];
  storyFlags: StoryFlags;
  killCount: Record<string, number>;

  constructor(name: string, className: string) {
    this.name = name;

    this.exp = 0;
    this.level = 1;

    this.class = className;
    const classStats = CLASSES[className]?.stats;
    if (!classStats) {
      throw new Error(`Unknown class: ${className}`);
    }

    this.attack = classStats.attack;
    this.defense = classStats.defense;
    this.maxHp = classStats.maxHp;
    this.magic = classStats.magic ?? 0;
    this.hp = this.maxHp;
    this.maxMana = classStats.maxMana ?? 0;
    this.mana = this.maxMana;

    this.luck = classStats.luck ?? 5;

    this.activeEffects = [];

    this.equipment = {
      weapon: null,
      armor: null,
      accessory: null,
    };
    this.inventory = {}; // {itemId: count}
    this.addStartingItems();

    this.gold = 50;

    this.activeQuests = [];
    this.completedQuests = [];
    this.storyFlags = {};

    this.killCount = {};
  }

  private adjustStat(
    stat: StatKey,
    amount: number,
    preserveHealthRatio = false,
  ) {
    switch (stat) {
      case "attack":
        this.attack += amount;
        break;
      case "defense":
        this.defense += amount;
        break;
      case "magic":
        this.magic += amount;
        break;
      case "luck":
        this.luck += amount;
        break;
      case "maxMana":
        this.maxMana += amount;
        this.mana = Math.min(this.mana, this.maxMana);
        break;
      case "maxHp": {
        const oldMax = this.maxHp;
        this.maxHp += amount;

        if (preserveHealthRatio && oldMax > 0) {
          const hpPercent = this.hp / oldMax;
          this.hp = Math.max(1, Math.floor(this.maxHp * hpPercent));
        } else {
          this.hp = Math.min(this.hp, this.maxHp);
        }
        break;
      }
    }
  }

  private applyStats(
    stats: Stats | undefined,
    multiplier: 1 | -1,
    preserveHealthRatio = false,
  ) {
    if (!stats) {
      return;
    }

    for (const [stat, value] of Object.entries(stats) as Array<
      [StatKey, number]
    >) {
      this.adjustStat(stat, value * multiplier, preserveHealthRatio);
    }
  }

  recordKill(enemyType: string) {
    if (!this.killCount[enemyType]) this.killCount[enemyType] = 0;
    this.killCount[enemyType]++;
  }

  applyEffect(effectId: string) {
    const effect = EFFECTS[effectId];
    if (!effect) return false;

    // Check for existing effect of same type
    const existingIndex = this.activeEffects.findIndex(
      (e) => e.id === effectId,
    );

    // Remove existing effect first
    if (existingIndex !== -1) {
      const existing = this.activeEffects[existingIndex];

      // Remove stat boosts
      this.applyStats(existing.stats, -1);

      // Cancel expiration timer
      clearTimeout(existing.timerId);

      // Remove from array
      this.activeEffects.splice(existingIndex, 1);

      console.log(
        chalk.yellow("\nExisting blessing removed before applying new one."),
      );
    }

    // Apply effect new stat boosts
    this.applyStats(effect.stats, 1);

    // Set expiration
    const effectClone: ActiveEffect = {
      ...effect,
      expiresAt: Date.now() + effect.duration * 1000,
    };
    this.activeEffects.push(effectClone);

    // Trigger callback
    if (effect.onApply) effect.onApply(this);

    console.log(chalk.yellow(`\n${effect.name} applied!`));

    return true;
  }

  updateEffects() {
    const now = Date.now();
    this.activeEffects = this.activeEffects.filter((effect) => {
      if (effect.expiresAt <= now) {
        // Remove effect stats
        this.applyStats(effect.stats, -1);

        // Trigger expiration callback
        if (effect.onExpire) effect.onExpire(this);

        console.log(chalk.yellow(`\n${effect.name} has worn off.`));
        return false;
      }
      return true;
    });
  }

  addStartingItems() {
    const startingItems = CLASSES[this.class]?.startingItems ?? [];
    startingItems.forEach((itemId) => {
      this.addItem(itemId);

      // Auto-equip weapons and armor
      const item = ITEMS[itemId];
      if (item && isEquipmentItem(item)) {
        this.equipItem(item);
      }
    });
  }

  addItem(itemId: string, count = 1) {
    if (!ITEMS[itemId]) {
      console.error(
        chalk.red(`[WARNING] Tried to add invalid item: ${itemId}`),
      );
      return false;
    }
    if (!this.inventory[itemId]) this.inventory[itemId] = 0;
    this.inventory[itemId] += count;

    return true;
  }

  removeItem(itemId: string, count = 1) {
    if (!this.inventory[itemId] || this.inventory[itemId] < count) {
      return false;
    }
    this.inventory[itemId] -= count;
    if (this.inventory[itemId] <= 0) {
      delete this.inventory[itemId];
    }
    return true;
  }

  hasItem(itemId: string) {
    return !!this.inventory[itemId] && this.inventory[itemId] > 0;
  }

  getInventoryCount(itemId: string) {
    return this.inventory[itemId] || 0;
  }

  addExp(amount: number) {
    this.exp += amount;
    while (
      this.level < EXP_LEVELS.length &&
      this.exp >= EXP_LEVELS[this.level]
    ) {
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
    const fireball = CLASSES.mage.abilities?.fireball;
    if (!fireball || typeof fireball.damageMultiplier !== "number") {
      return 0;
    }

    const { manaCost, damageMultiplier } = fireball;
    if (this.mana >= manaCost) {
      this.mana -= manaCost;
      return Math.floor(this.magic * damageMultiplier);
    }
    console.log(chalk.red("Not enough mana!"));
    return 0;
  }

  // Cleric-specific method
  divineHeal() {
    const divineHeal = CLASSES.cleric.abilities?.divineHeal;
    if (!divineHeal || typeof divineHeal.healMultiplier !== "number") {
      return 0;
    }

    const { manaCost, healMultiplier } = divineHeal;

    if (this.mana >= manaCost) {
      this.mana -= manaCost;
      const healAmount = Math.min(
        this.magic * healMultiplier,
        this.maxHp - this.hp,
      );
      this.hp += healAmount;

      console.log(chalk.yellow(`Divine healing restored ${healAmount} HP!`));
      return healAmount;
    }

    console.log(chalk.red("Not enough mana for healing!"));
    return 0;
  }

  isItemEquipped(itemId: string) {
    return (
      this.equipment.weapon?.id === itemId ||
      this.equipment.armor?.id === itemId ||
      this.equipment.accessory?.id === itemId
    );
  }

  unequipItemById(itemId: string) {
    if (this.equipment.weapon?.id === itemId) {
      this.unequipItem(this.equipment.weapon);
    } else if (this.equipment.armor?.id === itemId) {
      this.unequipItem(this.equipment.armor);
    } else if (this.equipment.accessory?.id === itemId) {
      this.unequipItem(this.equipment.accessory);
    }
  }

  equipItem(item: Item) {
    try {
      switch (item.type) {
        case "weapon":
          if (this.equipment.weapon) this.unequipItem(this.equipment.weapon);
          this.equipment.weapon = item;
          this.applyItemStats(item);

          console.log(chalk.green(`Equipped ${item.name}!`));
          break;
        case "armor":
          if (this.equipment.armor) this.unequipItem(this.equipment.armor);
          this.equipment.armor = item;
          this.applyItemStats(item);

          console.log(chalk.green(`Equipped ${item.name}!`));
          break;
        case "accessory":
          if (this.equipment.accessory)
            this.unequipItem(this.equipment.accessory);
          this.equipment.accessory = item;
          this.applyItemStats(item);
          console.log(chalk.green(`Equipped ${item.name} in accessory slot!`));
          break;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.log(chalk.red(`Cannot equip ${item.name}: ${message}`));
    }
  }

  unequipItem(item: Item) {
    this.removeItemStats(item);

    switch (item.type) {
      case "weapon":
        this.equipment.weapon = null;
        break;
      case "armor":
        this.equipment.armor = null;
        break;
      case "accessory":
        this.equipment.accessory = null;
        break;
    }

    console.log(chalk.yellow(`Unequipped ${item.name}`));
  }

  applyItemStats(item: Item) {
    this.applyStats(item.stats, 1, true);
  }

  removeItemStats(item: Item) {
    this.applyStats(item.stats, -1, true);
  }
}
