import chalk from "chalk";
import { OBJECT_TYPE, PLAYER_DEFAULTS, SLOT } from "../constants.ts";
import { EXP_LEVELS } from "../utils/expLevels.ts";
import { EFFECTS } from "../effects.ts";
import { getClass, getObject } from "../gameState.ts";
import type {
  ActiveEffect,
  ActiveQuest,
  Class,
  Equipment,
  Item,
  Stats,
  StoryFlags,
  ValueOf,
} from "../types.ts";

function getSlotForItemType(
  objectType: ValueOf<typeof OBJECT_TYPE>,
): SLOT | null {
  switch (objectType) {
    case OBJECT_TYPE.WEAPON:
      return SLOT.WEAPON;
    case OBJECT_TYPE.ARMOR:
      return SLOT.ARMOR;
    case OBJECT_TYPE.ACCESSORY:
      return SLOT.ACCESSORY;
    default:
      return null;
  }
}

function isEquipmentItem(item: Item): boolean {
  return getSlotForItemType(item.objectType) !== null;
}

export class Player {
  name: string;
  exp: number;
  level: number;
  class: Class;
  stats: Stats;
  activeEffects: ActiveEffect[];
  equipment: Equipment;
  inventory: Record<string, number>;
  gold: number;
  activeQuests: ActiveQuest[];
  completedQuests: ActiveQuest[];
  storyFlags: StoryFlags;
  killCount: Record<string, number>;

  constructor(name: string, classId: string) {
    this.name = name;

    this.exp = PLAYER_DEFAULTS.EXP;
    this.level = PLAYER_DEFAULTS.LEVEL;

    const selectedClass = getClass(classId);
    if (!selectedClass) {
      throw new Error(`Unknown class: ${classId}`);
    }

    if (!selectedClass.playable) {
      throw new Error(`Class is not playable: ${classId}`);
    }

    this.class = selectedClass as Class;
    const classStats = this.class.stats;

    this.stats = {
      hp: classStats.maxHp ?? 10,
      maxHp: classStats.maxHp ?? 10,
      attack: classStats.attack ?? 0,
      defense: classStats.defense ?? 0,
      magic: classStats.magic ?? 0,
      maxMana: classStats.maxMana ?? 0,
      mana: classStats.maxMana ?? 0,
      luck: classStats.luck ?? 0,
    };

    this.activeEffects = [];

    this.equipment = {
      weapon: null,
      armor: null,
      accessory: null,
    };
    this.inventory = {}; // {itemId: count}
    this.addStartingItems();

    this.gold = PLAYER_DEFAULTS.GOLD;

    this.activeQuests = [];
    this.completedQuests = [];
    this.storyFlags = {};

    this.killCount = {};
  }

  private adjustStat(
    stat: keyof Stats,
    amount: number,
    preserveHealthRatio = false,
  ) {
    switch (stat) {
      case "attack":
        this.stats.attack += amount;
        break;
      case "defense":
        this.stats.defense += amount;
        break;
      case "magic":
        this.stats.magic += amount;
        break;
      case "luck":
        this.stats.luck += amount;
        break;
      case "maxMana":
        this.stats.maxMana += amount;
        this.stats.mana = Math.min(this.stats.mana, this.stats.maxMana);
        break;
      case "maxHp": {
        const oldMax = this.stats.maxHp;
        this.stats.maxHp += amount;

        if (preserveHealthRatio && oldMax > 0) {
          const hpPercent = this.stats.hp / oldMax;
          this.stats.hp = Math.max(1, Math.floor(this.stats.maxHp * hpPercent));
        } else {
          this.stats.hp = Math.min(this.stats.hp, this.stats.maxHp);
        }
        break;
      }
    }
  }

  private applyStats(
    stats: Partial<Stats> | undefined,
    multiplier: 1 | -1,
    preserveHealthRatio = false,
  ) {
    if (!stats) {
      return;
    }

    for (const [stat, value] of Object.entries(stats ?? {}) as Array<
      [keyof Stats, number]
    >) {
      if (typeof value !== "number") continue;
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
    const startingItems = this.class.startingItems ?? [];
    startingItems.forEach((itemId: string) => {
      this.addItem(itemId);

      // Auto-equip weapons and armor
      const item = getObject(itemId);
      if (item && isEquipmentItem(item)) {
        this.equipItem(item);
      }
    });
  }

  addItem(itemId: string, count = 1) {
    if (!getObject(itemId)) {
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
    this.stats.maxHp += PLAYER_DEFAULTS.LEVEL_UP_HP_GAIN;
    this.stats.hp = this.stats.maxHp;
    console.log(chalk.yellow(`\n=== LEVEL UP! (${this.level}) ===`));
    console.log(`Max HP increased to ${this.stats.maxHp}`);
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
      const slot = getSlotForItemType(item.objectType);
      if (!slot) {
        throw new Error("Item cannot be equipped");
      }

      switch (slot) {
        case SLOT.WEAPON:
          if (this.equipment.weapon) this.unequipItem(this.equipment.weapon);
          this.equipment.weapon = item;
          this.applyItemStats(item);

          console.log(chalk.green(`Equipped ${item.name}!`));
          break;
        case SLOT.ARMOR:
          if (this.equipment.armor) this.unequipItem(this.equipment.armor);
          this.equipment.armor = item;
          this.applyItemStats(item);

          console.log(chalk.green(`Equipped ${item.name}!`));
          break;
        case SLOT.ACCESSORY:
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

    switch (getSlotForItemType(item.objectType)) {
      case SLOT.WEAPON:
        this.equipment.weapon = null;
        break;
      case SLOT.ARMOR:
        this.equipment.armor = null;
        break;
      case SLOT.ACCESSORY:
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
