import chalk from "chalk";
import { ACTOR_TYPE, OBJECT_TYPE, SLOT } from "../../constants.ts";
import type {
  Item,
  MobilePlayer,
  Reference,
  Statistic,
  ValueOf,
  Weapon,
  Armor,
  Alchemy,
  NPC,
  NPCInstance,
} from "../../types.ts";
import { getSlotForItemType } from "../systems/equipment.ts";
import * as math from "../utils/math.ts";

function cloneStatistic(statistic: Statistic): Statistic {
  return { ...statistic };
}

function createEquipHandlers(mobilePlayer: MobilePlayer) {
  mobilePlayer.equip = (itemId: string) => {
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

    const currently = mobilePlayer.object.equipment[slot];
    if (currently) {
      mobilePlayer.unequip(undefined, slot);
    }

    if (slot === SLOT.WEAPON) {
      mobilePlayer.object.equipment[slot] = item as Weapon;
    } else {
      mobilePlayer.object.equipment[slot] = item as Armor;
    }
    console.log(chalk.green(`Equipped ${item.name}!`));
    return true;
  };

  mobilePlayer.unequip = (itemId?: string, slot?: ValueOf<typeof SLOT>) => {
    if (itemId) {
      if (mobilePlayer.object.equipment.weapon?.id === itemId) {
        mobilePlayer.unequip(undefined, SLOT.WEAPON);
      }
      if (mobilePlayer.object.equipment.armor?.id === itemId) {
        mobilePlayer.unequip(undefined, SLOT.ARMOR);
      }
      return;
    }

    if (typeof slot !== "undefined") {
      const item = mobilePlayer.object.equipment[slot];
      if (!item) return false;
      mobilePlayer.object.equipment[slot] = null;
      console.log(chalk.yellow(`Unequipped ${item.name}`));
      return true;
    }

    return false;
  };
}

export function createPlayer(): Reference<NPCInstance> {
  const playerObject = mt.getObject("player") as NPC;

  const mobilePlayer = {
    actorType: ACTOR_TYPE.PLAYER,
    activeMagicEffectList: [],
    health: cloneStatistic(playerObject.health),
    magicka: cloneStatistic(playerObject.magicka),
    luck: cloneStatistic(playerObject.luck),
    strength: cloneStatistic(playerObject.strength),
    intelligence: cloneStatistic(playerObject.intelligence),
    willpower: cloneStatistic(playerObject.willpower),
    agility: cloneStatistic(playerObject.agility),
    speed: cloneStatistic(playerObject.speed),
    endurance: cloneStatistic(playerObject.endurance),
    personality: cloneStatistic(playerObject.personality),
    inventory: playerObject.inventory,
    barterGold: playerObject.barterGold,
    description: playerObject.description,
    fight: playerObject.fight,
    object: playerObject,
    skills: [...playerObject.skills],
    bounty: 0,
    levelUpProgress: 0,
    reference: null as unknown as Reference,
    equip: () => false,
    unequip: () => false,
    hasItemEquipped: () => false,
    levelUp: () => {},
    addExperience: () => {},
  } as unknown as MobilePlayer;
  mobilePlayer.levelUp = () => {
    mobilePlayer.object.level += 1;
    mobilePlayer.health.base = math.roundToTenth(
      mobilePlayer.health.base + mobilePlayer.endurance.base / 10,
    );
    mobilePlayer.health.current = mobilePlayer.health.base;
    console.log(
      chalk.yellow(`\n=== LEVEL UP! (${mobilePlayer.object.level}) ===`),
    );
    console.log(`Max HP increased to ${mobilePlayer.health.base}`);
  };
  mobilePlayer.addExperience = (xp: number) => {
    mobilePlayer.levelUpProgress += xp;
    const threshold = 10;
    while (mobilePlayer.levelUpProgress >= threshold) {
      mobilePlayer.levelUpProgress -= threshold;
      mobilePlayer.levelUp();
    }
  };

  createEquipHandlers(mobilePlayer);

  const playerReference: Reference<NPCInstance> = {
    id: "player",
    objectType: OBJECT_TYPE.NPC,
    data: {},
    tempData: {},
    object: playerObject,
    mobile: mobilePlayer,
    cell: null,
    previousNode: null,
    nextNode: null,
    isDead: false,
  };

  mobilePlayer.reference = playerReference;

  return playerReference;
}
