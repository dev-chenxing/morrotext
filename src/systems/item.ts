import { OBJECT_TYPE } from "../constants.ts";
import { getObject } from "../gameState.ts";
import { handleEquipment } from "./equipment.ts";
import type { Player } from "../types.ts";

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
