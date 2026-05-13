import chalk from "chalk";
import { SLOT } from "../constants.ts";
import { getObject } from "../gameState.ts";
import { createInventory } from "../systems/inventory.ts";
import type {
  Equipment,
  Item,
  Inventory,
  Statistic,
  ValueOf,
  Weapon,
  Armor,
  Alchemy,
} from "../types.ts";

function getSlotForItemType(objectType: ValueOf<typeof SLOT> | any): SLOT | null {
  // SLOT enum values are used as keys elsewhere; resolve by known object types
  switch (objectType) {
    case "WEAPON":
      return SLOT.WEAPON;
    case "ARMOR":
      return SLOT.ARMOR;
    default:
      return null;
  }
}

export class Actor {
  id: string;
  name: string;
  level: number;
  inventory: Inventory;
  equipment: Equipment;

  // Primary statistics
  health: Statistic;
  magicka: Statistic;
  luck: Statistic;

  // Attributes exposed directly on actor
  strength: Statistic;
  intelligence: Statistic;
  willpower: Statistic;
  agility: Statistic;
  speed: Statistic;
  endurance: Statistic;
  personality: Statistic;

  constructor(id: string, name: string, stats?: Partial<Record<string, any>>, level = 1) {
    this.id = id;
    this.name = name;
    this.level = level;

    this.inventory = createInventory();

    this.equipment = {
      [SLOT.WEAPON]: null,
      [SLOT.ARMOR]: null,
    };

    // Initialize statistics from provided `stats` object if present,
    // otherwise use sensible defaults.
    const maxHp = stats?.maxHp ?? 10;
    const hp = stats?.hp ?? maxHp;
    this.health = { base: maxHp, current: hp };
    this.magicka = { base: 0, current: 0 };

    // Attributes default to zero unless provided as `{ attribute: { base, current }}`
    const attr = (key: string, def = 0) =>
      stats && stats[key] ? (stats[key] as Statistic) : { base: def, current: def };

    this.strength = attr("strength");
    this.intelligence = attr("intelligence");
    this.willpower = attr("willpower");
    this.agility = attr("agility");
    this.speed = attr("speed");
    this.endurance = attr("endurance");
    this.personality = attr("personality");
    this.luck = attr("luck");
  }

  // Apply item stat modifiers to actor attributes, ignoring deprecated
  // HP/Mana keys. Items should not directly mutate HP/mana via equip/unequip.
  private applyItemModifiers(delta: Record<string, number> | undefined, multiplier: 1 | -1) {
    if (!delta) return;
    for (const [key, value] of Object.entries(delta)) {
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

  equip(itemId: string) {
    const item = getObject(itemId) as Item | Weapon | Armor | Alchemy | null;
    if (!item) {
      console.log(chalk.red(`Cannot equip unknown item: ${itemId}`));
      return false;
    }

    const slot = getSlotForItemType(item.objectType as any);
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
    // Apply item stat modifiers (attributes/luck). Deprecated HP/Mana keys are ignored.
    if ("stats" in (item as any) && (item as any).stats) {
      this.applyItemModifiers((item as any).stats as Record<string, number>, 1);
    }
    console.log(chalk.green(`Equipped ${item.name}!`));
    return true;
  }

  unequip(itemId?: string, slot?: SLOT) {
    if (itemId) {
      if (this.equipment.weapon?.id === itemId) this.unequip(undefined, SLOT.WEAPON);
      if (this.equipment.armor?.id === itemId) this.unequip(undefined, SLOT.ARMOR);
      return;
    }

    if (typeof slot !== "undefined") {
      const item = this.equipment[slot] as Weapon | Armor | null;
      if (!item) return false;
      if ("stats" in (item as any) && (item as any).stats) {
        this.applyItemModifiers((item as any).stats as Record<string, number>, -1);
      }
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
