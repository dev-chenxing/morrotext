import { CREATURE_TYPE, OBJECT_TYPE } from "./constants.ts";
import type { Player, ValueOf } from "./types.ts";
import { ITEMS } from "./world/items.ts";
import { handleEquipment } from "./systems/equipment.ts";

export async function useItem(
  player: Player,
  itemId: string,
  enemy: {
    type?: ValueOf<typeof CREATURE_TYPE>;
    hp?: number;
    name?: string;
  } | null = null,
): Promise<string | null> {
  const item = ITEMS[itemId];
  if (!item) return "Item not found.";

  let message: string | null = null;

  switch (item.objectType) {
    case OBJECT_TYPE.ALCHEMY:
      if (item.effect) {
        if (item.effect.hp) {
          const oldHP = player.stats.hp;
          player.stats.hp = Math.min(
            player.stats.maxHp,
            player.stats.hp + item.effect.hp,
          );
          message = `Restored ${player.stats.hp - oldHP} HP!`;
        }
        if (item.effect.mana) {
          const oldMana = player.stats.mana;
          player.stats.mana = Math.min(
            player.stats.maxMana,
            player.stats.mana + item.effect.mana,
          );
          message = `Restored ${player.stats.mana - oldMana} mana!`;
        }
        if (item.effect.damageUndead) {
          if (enemy && enemy.type === CREATURE_TYPE.UNDEAD) {
            const damage = item.effect.damageUndead;
            if (typeof enemy.hp === "number") {
              enemy.hp = Math.max(0, enemy.hp - damage);
            }
            message = `The holy water burns ${enemy.name || "the enemy"} for ${damage} damage!`;
          }
        }
      }
      break;

    case OBJECT_TYPE.WEAPON:
    case OBJECT_TYPE.ARMOR:
    case OBJECT_TYPE.ACCESSORY:
      await handleEquipment(player, item);
      break;

    default:
      message = "You can't use that item right now.";
  }

  // Remove alchemy items after use
  if (item.objectType === OBJECT_TYPE.ALCHEMY) {
    player.removeItem(itemId);
  }

  return message;
}
