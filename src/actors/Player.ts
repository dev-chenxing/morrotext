import chalk from "chalk";
import { OBJECT_TYPE, PLAYER_DEFAULTS, SLOT, SKILL } from "../constants.ts";
import { EXP_LEVELS } from "../utils/expLevels.ts";
import { getClass, getObject } from "../gameState.ts";
import type {
  ActiveQuest,
  Class,
  Equipment,
  Item,
  StoryFlags,
  Statistic,
  ValueOf,
  Weapon,
  Armor,
  Alchemy,
} from "../types.ts";

function getSlotForItemType(objectType: ValueOf<typeof OBJECT_TYPE>): SLOT | null {
  switch (objectType) {
    case OBJECT_TYPE.WEAPON:
      return SLOT.WEAPON;
    case OBJECT_TYPE.ARMOR:
      return SLOT.ARMOR;
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
  health: Statistic;
  magicka: Statistic;
  luck: Statistic;
  skills: number[];
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
    const classStats = (this.class as any).stats as Record<string, number> | undefined;

    // Initialize skills array sized to the number of defined SKILL constants
    const skillCount = Object.keys(SKILL).length;
    this.skills = new Array(skillCount).fill(0);

    const maxHp = classStats?.maxHp ?? 10;
    const hp = classStats?.hp ?? maxHp;
    this.health = { base: maxHp, current: hp };

    // Deprecated mana fields removed from player initialization. Magicka
    // remains but starts at zero; mana should be handled by specific systems.
    this.magicka = { base: 0, current: 0 };

    // Initialize `luck` alongside other attributes.
    this.luck =
      classStats && classStats["luck"]
        ? (classStats["luck"] as Statistic)
        : {
            base: PLAYER_DEFAULTS.LUCK ?? 0,
            current: PLAYER_DEFAULTS.LUCK ?? 0,
          };

    this.equipment = {
      weapon: null,
      armor: null,
    };
    this.inventory = {}; // {itemId: count}
    this.addStartingItems();

    this.gold = PLAYER_DEFAULTS.GOLD;

    this.activeQuests = [];
    this.completedQuests = [];
    this.storyFlags = {};

    this.killCount = {};
  }

  // Apply item stat modifiers to player attributes, ignoring deprecated
  // HP/Mana keys. Items should not directly mutate HP/mana via equip/unequip.
  private applyItemModifiers(stats: Record<string, number> | undefined, multiplier: 1 | -1) {
    if (!stats) return;
    for (const [key, value] of Object.entries(stats)) {
      if (typeof value !== "number") continue;
      const adj = value * multiplier;

      switch (key) {
        case "luck":
          this.luck.base += adj;
          this.luck.current += adj;
          break;
        case "strength":
        case "intelligence":
        case "willpower":
        case "agility":
        case "speed":
        case "endurance":
        case "personality": {
          const attr = (this as any)[key] as { base: number; current: number } | undefined;
          if (attr) {
            attr.base += adj;
            attr.current = Math.max(0, attr.current + adj);
          }
          break;
        }
        case "hp":
        case "maxHp":
        case "mana":
        case "maxMana":
          console.log(chalk.yellow(`Ignored deprecated stat modifier '${key}' on equip/unequip`));
          break;
        default:
          console.log(chalk.yellow(`Unknown stat key on item: ${key}`));
          break;
      }
    }
  }

  recordKill(enemyType: string) {
    if (!this.killCount[enemyType]) this.killCount[enemyType] = 0;
    this.killCount[enemyType]++;
  }

  // Runtime effect lifecycle removed from Player. Effects should be applied
  // directly by systems.

  addStartingItems() {
    const startingItems = this.class.startingItems ?? [];
    startingItems.forEach((itemId: string) => {
      this.addItem(itemId);

      // Auto-equip weapons and armor
      const item = getObject(itemId) as Item | Weapon | Armor | Alchemy | undefined;
      if (item && isEquipmentItem(item)) {
        this.equipItem(item as Item);
      }
    });
  }
  addItem(itemId: string, count = 1) {
    if (!getObject(itemId)) {
      console.error(chalk.red(`[WARNING] Tried to add invalid item: ${itemId}`));
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
    while (this.level < EXP_LEVELS.length && this.exp >= EXP_LEVELS[this.level]) {
      this.levelUp();
    }
  }

  levelUp() {
    this.level++;
    this.health.base += PLAYER_DEFAULTS.LEVEL_UP_HP_GAIN;
    this.health.current = this.health.base;
    console.log(chalk.yellow(`\n=== LEVEL UP! (${this.level}) ===`));
    console.log(`Max HP increased to ${this.health.base}`);
  }

  isItemEquipped(itemId: string) {
    return this.equipment.weapon?.id === itemId || this.equipment.armor?.id === itemId;
  }

  unequipItemById(itemId: string) {
    if (this.equipment.weapon?.id === itemId) {
      this.unequipItem(this.equipment.weapon);
    } else if (this.equipment.armor?.id === itemId) {
      this.unequipItem(this.equipment.armor);
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
          this.equipment.weapon = item as Weapon;
          if ("stats" in (item as any) && (item as any).stats) this.applyItemStats(item);

          console.log(chalk.green(`Equipped ${item.name}!`));
          break;
        case SLOT.ARMOR:
          if (this.equipment.armor) this.unequipItem(this.equipment.armor);
          this.equipment.armor = item as Armor;
          if ("stats" in (item as any) && (item as any).stats) this.applyItemStats(item);

          console.log(chalk.green(`Equipped ${item.name}!`));
          break;
        default:
          // No other slots supported
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
      default:
        break;
    }

    console.log(chalk.yellow(`Unequipped ${item.name}`));
  }

  applyItemStats(item: Item) {
    if ("stats" in (item as any) && (item as any).stats) {
      this.applyItemModifiers((item as any).stats as Record<string, number>, 1);
    }
  }

  removeItemStats(item: Item) {
    if ("stats" in (item as any) && (item as any).stats) {
      this.applyItemModifiers((item as any).stats as Record<string, number>, -1);
    }
  }
}
