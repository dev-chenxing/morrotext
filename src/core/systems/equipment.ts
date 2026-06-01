import chalk from "chalk";
import { SLOT, OBJECT_TYPE } from "../../constants.ts";
import type { Item, MobilePlayer, ValueOf } from "../../types.ts";
import { list } from "../ui/prompt.ts";

export function getSlotForItemType(
  itemOrObjectType: Item | ValueOf<typeof OBJECT_TYPE>,
): SLOT | null {
  const objectType =
    typeof itemOrObjectType === "string" ? itemOrObjectType : itemOrObjectType.objectType;

  switch (objectType) {
    case OBJECT_TYPE.WEAPON:
      return SLOT.WEAPON;
    case OBJECT_TYPE.ARMOR:
      return SLOT.ARMOR;
    default:
      return null;
  }
}

export function isEquipmentItem(item: Item): boolean {
  return getSlotForItemType(item) !== null;
}

export async function handleEquipment(player: MobilePlayer, item: Item) {
  const isEquipped = player.object.hasItemEquipped(item.id);

  const choices: Array<{ name: string; value: string }> = [];

  if (isEquipped) {
    choices.push({ name: "Unequip", value: "unequip" });
  } else if (isEquipmentItem(item)) {
    choices.push({ name: "Equip", value: "equip" });
  }

  choices.push({ name: "Inspect", value: "inspect" }, { name: "Cancel", value: "cancel" });

  const { action } = await list<{ action: string }>({
    name: "action",
    message: `What to do with ${item.name}?`,
    choices,
  });

  if (action === "equip") {
    player.equip(item.id);
  } else if (action === "unequip") {
    player.unequip(item.id);
  } else if (action === "inspect") {
    console.log(chalk.yellow(`\n${item.name}:`));
    console.log(`Type: ${item.objectType}`);
    // `value` exists on valued item subtypes (weapon/armor/alchemy)
    if ("value" in (item as any)) console.log(`Value: ${(item as any).value} gold`);
    // Show armor rating for armor items
    if ("armorRating" in (item as any)) console.log(`Armor: ${(item as any).armorRating}`);
    // Show generic stats for items that expose a `stats` map.
    if ("stats" in (item as any) && (item as any).stats)
      Object.entries((item as any).stats).forEach(([stat, val]) => {
        if (typeof val === "number") {
          console.log(`${stat}: ${val > 0 ? "+" : ""}${val}`);
        }
      });
    if (item.description) console.log(`\n${item.description}`);
    return handleEquipment(player, item); // Return to options
  }
}

export default handleEquipment;
