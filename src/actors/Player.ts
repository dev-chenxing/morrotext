import chalk from "chalk";
import { ATTRIBUTES, PLAYER_DEFAULTS, SLOT } from "../constants.ts";
import { getClass, getObject } from "../gameState.ts";
import { createClassActorProfile } from "../systems/class.ts";
import { getSlotForItemType, isEquipmentItem } from "../systems/equipment.ts";
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

export class Player {
  name: string;
  level: number;
  class: Class;
  health: Statistic;
  magicka: Statistic;
  luck: Statistic;
  strength: Statistic;
  intelligence: Statistic;
  willpower: Statistic;
  agility: Statistic;
  speed: Statistic;
  endurance: Statistic;
  personality: Statistic;
  skills: number[];
  equipment: Equipment;
  inventory: Record<string, number>;
  activeQuests: ActiveQuest[];
  completedQuests: ActiveQuest[];
  storyFlags: StoryFlags;
  killCount: Record<string, number>;

  constructor(name: string, classId: string) {
    this.name = name;

    this.level = PLAYER_DEFAULTS.LEVEL;

    const selectedClass = getClass(classId);
    if (!selectedClass) {
      throw new Error(`Unknown class: ${classId}`);
    }

    if (!selectedClass.playable) {
      throw new Error(`Class is not playable: ${classId}`);
    }

    this.class = selectedClass;

    const classProfile = createClassActorProfile(this.class);
    this.skills = [...classProfile.skills];
    this.health = { ...classProfile.health };
    this.magicka = { ...classProfile.magicka };
    this.strength = { ...classProfile.attributes[ATTRIBUTES.STRENGTH] };
    this.intelligence = { ...classProfile.attributes[ATTRIBUTES.INTELLIGENCE] };
    this.willpower = { ...classProfile.attributes[ATTRIBUTES.WILLPOWER] };
    this.agility = { ...classProfile.attributes[ATTRIBUTES.AGILITY] };
    this.speed = { ...classProfile.attributes[ATTRIBUTES.SPEED] };
    this.endurance = { ...classProfile.attributes[ATTRIBUTES.ENDURANCE] };
    this.personality = { ...classProfile.attributes[ATTRIBUTES.PERSONALITY] };
    this.luck = { ...classProfile.attributes[ATTRIBUTES.LUCK] };

    this.equipment = {
      weapon: null,
      armor: null,
    };
    this.inventory = {}; // {itemId: count}
    this.addStartingItems();

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
      if (!this.inventory[itemId]) this.inventory[itemId] = 0;
      this.inventory[itemId] += 1;

      // Auto-equip weapons and armor
      const item = getObject(itemId) as Item | Weapon | Armor | Alchemy | undefined;
      if (item && isEquipmentItem(item)) {
        this.equipItem(item as Item);
      }
    });
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

  unequip(itemId?: string, slot?: ValueOf<typeof SLOT>) {
    if (this.equipment.weapon?.id === itemId) {
      this.unequip(undefined, SLOT.WEAPON);
    } else if (this.equipment.armor?.id === itemId) {
      this.unequip(undefined, SLOT.ARMOR);
      return;
    }

    if (typeof slot !== "undefined") {
      const item = this.equipment[slot];
      if (!item) return false;

      this.removeItemStats(item);
      this.equipment[slot] = null;
      console.log(chalk.yellow(`Unequipped ${item.name}`));
      return true;
    }

    return false;
  }

  equipItem(item: Item) {
    try {
      const slot = getSlotForItemType(item.objectType);
      if (!slot) {
        throw new Error("Item cannot be equipped");
      }

      switch (slot) {
        case SLOT.WEAPON:
          if (this.equipment.weapon) this.unequip(undefined, SLOT.WEAPON);
          this.equipment.weapon = item as Weapon;
          if ("stats" in (item as any) && (item as any).stats) this.applyItemStats(item);

          console.log(chalk.green(`Equipped ${item.name}!`));
          break;
        case SLOT.ARMOR:
          if (this.equipment.armor) this.unequip(undefined, SLOT.ARMOR);
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
