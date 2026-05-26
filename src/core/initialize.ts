import npcDialogues from "../data/dialogues.ts";
import { OBJECT_TYPE } from "../constants.ts";
import { game } from "./gameState.ts";
import { createClass } from "./systems/class.ts";
import type {
  Action,
  Cell,
  Class,
  Creature,
  Dialogue,
  DialogueInfo,
  GameObject,
  LeveledItem,
  NPC,
  Quest,
  ReferenceList,
} from "../types.ts";
import { ACTIONS } from "../data/actions.ts";
import { cells } from "../data/cells.ts";
import { CLASSES } from "../data/classes.ts";
import { createCreature, CREATURES } from "../data/creatures.ts";
import { ITEMS } from "../data/items.ts";
import { createLeveledItem, LEVELED_ITEMS } from "../data/leveledItems.ts";
import { createNPC, NPC_REGISTRY } from "../data/npcs.ts";
import { QUESTS } from "../data/quests.ts";

function createEmptyReferenceList(cell: Cell): ReferenceList {
  return {
    cell,
    head: null,
    tail: null,
    size: 0,
  };
}

function cloneCells(source: Record<string, Cell>): Cell[] {
  return Object.values(source).map((cell) => ({
    ...cell,
    activators: createEmptyReferenceList(cell),
    actors: createEmptyReferenceList(cell),
    statics: createEmptyReferenceList(cell),
  }));
}

function cloneDialogues(source: Record<string, any>): Dialogue[] {
  return Object.values(source).map((dialogue: any) => {
    const cloned: Dialogue = {
      id: dialogue.id,
      info: [],
      journalIndex: dialogue.journalIndex ?? null,
      objectType: dialogue.objectType,
    } as Dialogue;

    // If the source already provides `info` (new format), clone it first.
    if (dialogue.info) {
      cloned.info = dialogue.info.map((entry: any) => ({ ...entry }));
    }

    // If the source uses the legacy `dialogues` state map, flatten states
    // into `info` entries while preserving the state's question and key.
    if (dialogue.dialogues) {
      for (const [stateKey, state] of Object.entries(dialogue.dialogues)) {
        const question = (state as any).question;
        const options = (state as any).options ?? [];
        for (const opt of options) {
          const infoEntry: any = { ...(opt as any) };
          if (question !== undefined) infoEntry.prompt = question;
          infoEntry._state = stateKey;
          cloned.info.push(infoEntry as DialogueInfo);
        }
      }
    }

    return cloned;
  });
}

function createActions(): Action[] {
  return ACTIONS.map((action) => ({ ...action }));
}

function createObjects(): GameObject[] {
  return Object.values(ITEMS).map((item) => ({ ...item }));
}

function createLeveledItems(): LeveledItem[] {
  return LEVELED_ITEMS.map((entry) => createLeveledItem(entry.id)).filter(
    (leveledItem): leveledItem is LeveledItem => Boolean(leveledItem),
  );
}

function createCreatures(): Creature[] {
  return CREATURES.map((entry) => createCreature(entry));
}

function createClasses(actions: Action[]): Class[] {
  return CLASSES.map((entry) => createClass(entry, actions));
}

function createNPCs(classes: Class[]): NPC[] {
  return NPC_REGISTRY.map((entry) => createNPC(entry, classes));
}

function createQuests(): Quest[] {
  return Object.keys(QUESTS).map((questId) => ({
    id: questId,
    objectType: OBJECT_TYPE.QUEST,
    dialogue: [],
    isActive: false,
    isStarted: false,
    isFinished: false,
  }));
}

export function initializeGameData() {
  if (game.dataHandler.nonDynamicData.actions.length > 0) {
    if (game.worldController.quests.length === 0) {
      game.worldController.quests = createQuests();
    }
    return game.dataHandler.nonDynamicData;
  }

  game.dataHandler.nonDynamicData.actions = createActions();
  game.dataHandler.nonDynamicData.classes = createClasses(
    game.dataHandler.nonDynamicData.actions,
  );
  game.dataHandler.nonDynamicData.objects = createObjects();
  game.dataHandler.nonDynamicData.objects.push(...createLeveledItems());
  game.dataHandler.nonDynamicData.objects.push(...createCreatures());
  game.dataHandler.nonDynamicData.objects.push(
    ...createNPCs(game.dataHandler.nonDynamicData.classes),
  );
  game.dataHandler.nonDynamicData.dialogues = cloneDialogues(npcDialogues);
  game.dataHandler.nonDynamicData.cells = cloneCells(cells);
  game.worldController.quests = createQuests();

  return game.dataHandler.nonDynamicData;
}
