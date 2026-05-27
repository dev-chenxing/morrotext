import { OBJECT_TYPE } from "../../constants.ts";
import type {
  Alchemy,
  AlchemyRegistryEntry,
  Armor,
  ArmorRegistryEntry,
  Misc,
  MiscRegistryEntry,
  Player,
  Weapon,
  WeaponRegistryEntry,
} from "../../types.ts";
import { getObject } from "../gameState.ts";
import { handleEquipment } from "./equipment.ts";

export function createAlchemy(entry: AlchemyRegistryEntry): Alchemy {
  return { ...entry };
}

export function createArmor(entry: ArmorRegistryEntry): Armor {
  return { ...entry };
}

export function createMisc(entry: MiscRegistryEntry): Misc {
  return { ...entry };
}

export function createWeapon(entry: WeaponRegistryEntry): Weapon {
  return { ...entry };
}

export async function useItem(player: Player, itemId: string): Promise<string | null> {
  const item = getObject(itemId);
  if (!item) return "Item not found.";

  let message = null;

  switch (item.objectType) {
    case OBJECT_TYPE.ALCHEMY:
      message = `You use the ${item.name}.`;
      break;

    case OBJECT_TYPE.WEAPON:
    case OBJECT_TYPE.ARMOR:
      await handleEquipment(player, item);
      break;

    default:
      message = "You can't use that item right now.";
  }

  // Remove alchemy items after use
  if (item.objectType === OBJECT_TYPE.ALCHEMY) {
    player.inventory.removeItem(itemId, 1);
  }

  return message;
}
