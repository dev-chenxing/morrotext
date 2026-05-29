import { OBJECT_TYPE } from "../constants.ts";
import type {
  Actor,
  Cell,
  Class,
  DataHandler,
  Dialogue,
  DialogueInfo,
  GameObject,
  Item,
  MobileActor,
  MobilePlayer,
  MtApi,
  Reference,
  WorldController,
} from "../types.ts";

const state: {
  player: Reference | null;
  dataHandler: DataHandler;
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
  worldController: { allMobileActors: [], mobilePlayer: null, quests: [] },
};

function getActions(target: Reference | MobileActor | Actor) {
  // If the target is a Reference, use its object for action retrieval
  const actor = ("object" in target ? target.object : target) as Actor;

  // Retrieve actions based on the actor's class and any specific conditions
  if ("class" in actor && actor.class) {
    return (actor as Actor & { class: Class }).class.actions;
  }

  // Default to an empty action list if no specific actions are found

  return [];
}

function getCell(cellId: string): Cell | undefined {
  return state.dataHandler.nonDynamicData.cells.find(
    (cell) => cell.id === cellId,
  );
}

function getClass(classId: string): Class | undefined {
  return state.dataHandler.nonDynamicData.classes.find(
    (gameClass) => gameClass.id === classId,
  );
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

// Locates and returns a Dialogue Info by a given id.
// This involves file IO and is an expensive call. Results should be cached.
function getDialogueInfo(
  dialogue: Dialogue | string,
  id: string,
): DialogueInfo | null {
  return (
    state.dataHandler.nonDynamicData.dialogues
      .find(
        (d) => d.id === (typeof dialogue === "string" ? dialogue : dialogue.id),
      )
      ?.info.find((info) => info.id === id) ?? null
  );
}

function getObject(objectId: string): Item | undefined {
  const object = state.dataHandler.nonDynamicData.objects.find(
    (obj) => obj.id === objectId,
  );
  if (object && isItemObject(object)) {
    return object;
  }
  return undefined;
}

export const mt: MtApi = {
  get player() {
    return state.player;
  },
  set player(player: Reference | null) {
    state.player = player;
  },
  get mobilePlayer() {
    return state.worldController.mobilePlayer;
  },
  set mobilePlayer(player: MobilePlayer | null) {
    state.worldController.mobilePlayer = player;
  },
  dataHandler: state.dataHandler,
  worldController: state.worldController,
  getActions,
  getCell,
  getClass,
  getDialogueInfo,
  getObject,
};

export function attachMtGlobal(): MtApi {
  globalThis.mt = mt;
  return globalThis.mt;
}
