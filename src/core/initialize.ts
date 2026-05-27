import { OBJECT_TYPE } from "../constants.ts";
import type { Cell, Dialogue, DialogueInfo, ReferenceList } from "../types.ts";
import { ACTIONS } from "../data/actions.ts";
import { ALCHEMY } from "../data/alchemy.ts";
import { ARMORS } from "../data/armors.ts";
import { cells } from "../data/cells.ts";
import { CLASSES } from "../data/classes.ts";
import { CREATURES } from "../data/creatures.ts";
import npcDialogues from "../data/dialogues.ts";
import { MISC_ITEMS } from "../data/misc.ts";
import { NPC_REGISTRY } from "../data/npcs.ts";
import { QUESTS } from "../data/quests.ts";
import { WEAPONS } from "../data/weapons.ts";
import { createClass } from "./systems/class.ts";
import { createCreature } from "./systems/creature.ts";
import { createLeveledItems } from "./systems/leveledList.ts";
import { createNPC } from "./systems/npc.ts";
import { game } from "./gameState.ts";

function createEmptyReferenceList(cell: Cell): ReferenceList {
  return { cell, head: null, tail: null, size: 0 };
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

function createActions(): void {
  game.dataHandler.nonDynamicData.actions = ACTIONS.map((action) => ({ ...action }));
}

function createObjects(): void {
  game.dataHandler.nonDynamicData.objects = Object.values({
    ...ALCHEMY,
    ...WEAPONS,
    ...ARMORS,
    ...MISC_ITEMS,
  }).map((item) => ({ ...item }));
}

function createCreatures(): void {
  game.dataHandler.nonDynamicData.objects.push(...CREATURES.map((entry) => createCreature(entry)));
}

function createClasses(): void {
  game.dataHandler.nonDynamicData.classes = CLASSES.map((entry) =>
    createClass(entry, game.dataHandler.nonDynamicData.actions),
  );
}

function createNPCs(): void {
  game.dataHandler.nonDynamicData.objects.push(
    ...NPC_REGISTRY.map((entry) => createNPC(entry, game.dataHandler.nonDynamicData.classes)),
  );
}

function createDialogues(): void {
  game.dataHandler.nonDynamicData.dialogues = cloneDialogues(npcDialogues);
}

function createCells(): void {
  game.dataHandler.nonDynamicData.cells = cloneCells(cells);
}

function createQuests(): void {
  game.worldController.quests = Object.keys(QUESTS).map((questId) => ({
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
    return game.dataHandler.nonDynamicData;
  }

  createActions();
  createClasses();
  createObjects();
  createLeveledItems();
  createCreatures();
  createNPCs();
  createDialogues();
  createCells();
  createQuests();

  return game.dataHandler.nonDynamicData;
}
