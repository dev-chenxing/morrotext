import chalk from "chalk";
import { ATTRIBUTES, PLAYER_DEFAULTS, SLOT, OBJECT_TYPE } from "../constants.ts";
import { getClass } from "../gameState.ts";
import { createClassActorProfile } from "../systems/class.ts";
import { getSlotForItemType } from "../systems/equipment.ts";
import Actor from "./Actor.ts";
import { createInventory } from "../systems/inventory.ts";
import type { ActiveQuest, Class, Item, StoryFlags, ValueOf, Weapon, Armor } from "../types.ts";

export class Player extends Actor {
  class: Class;
  skills: number[];
  activeQuests: ActiveQuest[];
  completedQuests: ActiveQuest[];
  storyFlags: StoryFlags;
  killCount: Record<string, number>;

  constructor(name: string, classId: string) {
    // use a stable id for player
    super("player", name, PLAYER_DEFAULTS.LEVEL);
    this.objectType = OBJECT_TYPE.PLAYER;

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
    this.inventory = createInventory();

    this.activeQuests = [];
    this.completedQuests = [];
    this.storyFlags = {};

    this.killCount = {};
  }

  recordKill(enemyType: string) {
    if (!this.killCount[enemyType]) this.killCount[enemyType] = 0;
    this.killCount[enemyType]++;
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

          console.log(chalk.green(`Equipped ${item.name}!`));
          break;
        case SLOT.ARMOR:
          if (this.equipment.armor) this.unequip(undefined, SLOT.ARMOR);
          this.equipment.armor = item as Armor;

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
}
