import chalk from "chalk";
import { SLOT, OBJECT_TYPE } from "../../constants.ts";
import { GameObject } from "../../types.ts";
import type {
  Equipment,
  Item,
  Inventory,
  Statistic,
  Weapon,
  Armor,
  Alchemy,
  ValueOf,
} from "../../types.ts";
import { getSlotForItemType } from "../systems/equipment.ts";
import { createInventory } from "../systems/inventory.ts";

export class Actor extends GameObject {
  // Common fields
  name: string;
  description: string;
  level: number;
  inventory: Inventory;
  equipment: Equipment;

  // Primary statistics
  health: Statistic;
  magicka: Statistic;
  luck: Statistic;

  // AI behavior fields
  fight: number;

  // barter gold available for trading
  barterGold: number;

  // Attributes exposed directly on actor
  strength: Statistic;
  intelligence: Statistic;
  willpower: Statistic;
  agility: Statistic;
  speed: Statistic;
  endurance: Statistic;
  personality: Statistic;

  constructor(
    objectType: ValueOf<typeof OBJECT_TYPE>,
    id: string,
    name: string,
    level = 1,
    description = "",
    fight = 0,
  ) {
    super(id, objectType);
    this.name = name;
    this.level = level;

    this.inventory = createInventory();
    this.equipment = { [SLOT.WEAPON]: null, [SLOT.ARMOR]: null };
    this.barterGold = 0;

    // Initialize attributes

    // Attributes default to zero.
    const attr = (key: string, def = 0) => ({ base: def, current: def }) as Statistic;

    this.strength = attr("strength");
    this.intelligence = attr("intelligence");
    this.willpower = attr("willpower");
    this.agility = attr("agility");
    this.speed = attr("speed");
    this.endurance = attr("endurance");
    this.personality = attr("personality");
    this.luck = attr("luck");

    // Determine starting max HP from attributes: (strength + endurance) / 2
    const maxHp = Math.floor((this.strength.base + this.endurance.base) / 2);
    this.health = { base: maxHp, current: maxHp };
    this.magicka = { base: 0, current: 0 };

    // Actor-level runtime fields
    this.description = description;
    this.fight = fight;
  }

  equip(itemId: string) {
    const item = mt.getObject(itemId) as Item | Weapon | Armor | Alchemy | null;
    if (!item) {
      console.log(chalk.red(`Cannot equip unknown item: ${itemId}`));
      return false;
    }

    const slot = getSlotForItemType(item.objectType);
    if (!slot) {
      console.log(chalk.red(`Item ${item.name} is not equippable.`));
      return false;
    }

    // If something is already equipped in this slot, unequip it first
    const currently = this.equipment[slot];
    if (currently) {
      this.unequip(undefined, slot);
    }

    this.equipment[slot] = item as any;
    console.log(chalk.green(`Equipped ${item.name}!`));
    return true;
  }

  unequip(itemId?: string, slot?: ValueOf<typeof SLOT>) {
    if (itemId) {
      if (this.equipment.weapon?.id === itemId) this.unequip(undefined, SLOT.WEAPON);
      if (this.equipment.armor?.id === itemId) this.unequip(undefined, SLOT.ARMOR);
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

  hasItemEquipped(itemId: string) {
    return this.equipment.weapon?.id === itemId || this.equipment.armor?.id === itemId;
  }

  levelUp() {
    this.level++;
  }
}

export default Actor;
