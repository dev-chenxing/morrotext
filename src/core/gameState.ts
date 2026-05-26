import type { Player } from "./actors/Player.ts";
import type {
  Action,
  Cell,
  Class,
  Creature,
  Dialogue,
  GameObject,
  Item,
  LeveledItem,
  MobileActor,
  NPC,
  Quest,
} from "../types.ts";
import { OBJECT_TYPE } from "../constants.ts";

export type NonDynamicData = {
  actions: Action[];
  cells: Cell[];
  classes: Class[];
  dialogues: Dialogue[];
  objects: GameObject[];
};

export type WorldController = {
  allMobileActors: MobileActor[];
  quests: Quest[];
};

export const game: {
  player: Player | null;
  dataHandler: {
    nonDynamicData: NonDynamicData;
  };
  worldController: WorldController;
} = {
  player: null,
  dataHandler: {
    nonDynamicData: {
      actions: [],
      cells: [],
      classes: [],
      dialogues: [],
      objects: [],
    },
  },
  worldController: {
    allMobileActors: [],
    quests: [],
  },
};

export function getNonDynamicData(): NonDynamicData {
  return game.dataHandler.nonDynamicData;
}

export function getAction(actionId: string): Action | undefined {
  return getNonDynamicData().actions.find((action) => action.id === actionId);
}

export function getCell(cellId: string): Cell | undefined {
  return getNonDynamicData().cells.find((cell) => cell.id === cellId);
}

export function getClass(classId: string): Class | undefined {
  return getNonDynamicData().classes.find((gameClass) => gameClass.id === classId);
}

export function getGameObject(objectId: string): GameObject | undefined {
  return getNonDynamicData().objects.find((object) => object.id === objectId);
}

function isItemObject(object: GameObject): object is Item {
  switch (object.objectType) {
    case OBJECT_TYPE.ACCESSORY:
    case OBJECT_TYPE.ALCHEMY:
    case OBJECT_TYPE.ARMOR:
    case OBJECT_TYPE.BOOK:
    case OBJECT_TYPE.ITEM:
    case OBJECT_TYPE.MISC:
    case OBJECT_TYPE.WEAPON:
      return true;
    default:
      return false;
  }
}

function isCreatureObject(object: GameObject): object is Creature {
  return object.objectType === OBJECT_TYPE.ACTOR;
}

function isNPCObject(object: GameObject): object is NPC {
  return object.objectType === OBJECT_TYPE.NPC;
}

export function getLeveledItem(leveledItemId: string): LeveledItem | undefined {
  const object = getGameObject(leveledItemId);
  return object?.objectType === OBJECT_TYPE.LEVELED_ITEM ? (object as LeveledItem) : undefined;
}

export function getCreature(creatureId: string): Creature | undefined {
  const object = getGameObject(creatureId);
  return object && isCreatureObject(object) ? object : undefined;
}

export function getDialogue(dialogueId: string): Dialogue | undefined {
  return getNonDynamicData().dialogues.find((dialogue) => dialogue.id === dialogueId);
}

export function getNPC(npcId: string): NPC | undefined {
  const object = getGameObject(npcId);
  return object && isNPCObject(object) ? object : undefined;
}

export function getObject(objectId: string): Item | undefined {
  const object = getGameObject(objectId);
  return object && isItemObject(object) ? object : undefined;
}
