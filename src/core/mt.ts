import type {
  Actor,
  Cell,
  Class,
  DataHandler,
  Dialogue,
  DialogueInfo,
  Inventory,
  Item,
  MobileActor,
  MobilePlayer,
  MtApi,
  NPCInstance,
  Reference,
  WorldController,
} from "../types.ts";
import { runScript } from "./systems/script.ts";
import { appendReferenceToCell, enterCell } from "./systems/cell.ts";
import { resolveReference } from "./systems/reference.ts";
import { MobManager } from "./systems/mob.ts";
import { findQuest, getJournalIndex, updateJournal } from "./systems/quest.ts";

const state: {
  player: Reference<NPCInstance> | null;
  mobilePlayer: MobilePlayer | null;
  dataHandler: DataHandler;
  worldController: WorldController;
} = {
  player: null,
  mobilePlayer: null,
  dataHandler: {
    nonDynamicData: { actions: [], cells: [], classes: [], dialogues: [], objects: [] },
  },
  worldController: { allMobileActors: [], mobManager: new MobManager(), quests: [] },
};

function addItem(
  target: Reference | MobileActor | Actor | null,
  itemId: string,
  count = 1,
): number {
  return getInventory(target)?.addItem(itemId, count) ?? 0;
}

function addTopic(_topicId: string): void {
  // Topics are currently sourced directly from initialized dialogue records.
}

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
  return state.dataHandler.nonDynamicData.cells.find((cell) => cell.id === cellId);
}

function getClass(classId: string): Class | undefined {
  return state.dataHandler.nonDynamicData.classes.find((gameClass) => gameClass.id === classId);
}

// Locates and returns a Dialogue Info by a given id.
// This involves file IO and is an expensive call. Results should be cached.
function getDialogueInfo(dialogue: Dialogue | string, id: string): DialogueInfo | null {
  return (
    state.dataHandler.nonDynamicData.dialogues
      .find((d) => d.id === (typeof dialogue === "string" ? dialogue : dialogue.id))
      ?.info.find((info) => info.id === id) ?? null
  );
}

function getInventory(target: Reference | MobileActor | Actor | null): Inventory | null {
  if (!target) return null;

  if ("inventory" in target && target.inventory) {
    return target.inventory;
  }

  if ("mobile" in target && target.mobile && "inventory" in target.mobile) {
    return target.mobile.inventory;
  }

  if ("object" in target && target.object && "inventory" in target.object) {
    return target.object.inventory as Inventory;
  }

  return null;
}

function getItemCount(target: Reference | MobileActor | Actor | null, itemId: string): number {
  return getInventory(target)?.getItemCount(itemId) ?? 0;
}

function getObject(objectId: string): Item | undefined {
  return state.dataHandler.nonDynamicData.objects.find((obj) => obj.id === objectId) as
    | Item
    | undefined;
}

async function positionCell(opts: {
  reference?: Reference | MobileActor | string;
  cell: Cell | string;
}): Promise<boolean> {
  const cell = typeof opts.cell === "string" ? getCell(opts.cell) : opts.cell;
  if (!cell) {
    throw new Error(`Unknown cell: ${JSON.stringify(opts.cell)}`);
  }

  if (!opts.reference) {
    await enterCell(mt.mobilePlayer, cell);
    return true;
  }
  const resolvedReference = resolveReference(opts.reference);
  if (resolvedReference) {
    appendReferenceToCell(resolvedReference, cell);
    return true;
  }

  return false;
}

function removeItem(
  target: Reference | MobileActor | Actor | null,
  itemId: string,
  count = 1,
): number {
  return getInventory(target)?.removeItem(itemId, count) ?? 0;
}

export const mt: MtApi = {
  get player() {
    if (!state.player) {
      throw new Error("mt.player is not set");
    }
    return state.player;
  },
  set player(player: Reference<NPCInstance>) {
    state.player = player;
  },
  get mobilePlayer() {
    if (!state.mobilePlayer) {
      throw new Error("mt.mobilePlayer is not set");
    }
    return state.mobilePlayer;
  },
  set mobilePlayer(player: MobilePlayer) {
    state.mobilePlayer = player;
  },
  dataHandler: state.dataHandler,
  worldController: state.worldController,
  addItem,
  addTopic,
  findQuest,
  getActions,
  getCell,
  getClass,
  getDialogueInfo,
  getItemCount,
  getJournalIndex,
  getObject,
  runScript,
  positionCell,
  removeItem,
  updateJournal,
};

export function attachMtGlobal(): MtApi {
  globalThis.mt = mt;
  return globalThis.mt;
}
