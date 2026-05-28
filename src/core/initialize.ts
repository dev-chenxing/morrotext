import { DIALOGUE_TYPE, OBJECT_TYPE } from "../constants.ts";
import type {
  Cell,
  Dialogue,
  DialogueInfo,
  DialogueRecordSet,
  GameObject,
  Reference,
  ReferenceList,
} from "../types.ts";
import { ACTIONS } from "../data/actions.ts";
import { ALCHEMY } from "../data/alchemy.ts";
import { ARMORS } from "../data/armors.ts";
import { CELL_REFERENCES, cells } from "../data/cells/index.ts";
import { CLASSES } from "../data/classes.ts";
import { CREATURES } from "../data/creatures.ts";
import dialogues from "../data/dialogues.ts";
import { MISC_ITEMS } from "../data/misc.ts";
import { NPC_REGISTRY } from "../data/npcs.ts";
import { QUESTS } from "../data/quests.ts";
import { WEAPONS } from "../data/weapons.ts";
import { createClass } from "./systems/class.ts";
import { createCreature } from "./systems/creature.ts";
import { createAlchemy, createArmor, createMisc, createWeapon } from "./systems/item.ts";
import { createLeveledItems } from "./systems/leveledList.ts";
import { createNPC } from "./systems/npc.ts";
import { game } from "./gameState.ts";

function createEmptyReferenceList(cell: Cell): ReferenceList {
  return { cell, head: null, tail: null, size: 0 };
}

function appendReference(list: ReferenceList, object: GameObject): Reference {
  const reference: Reference = {
    id: `${list.cell.id}:${object.id}:${list.size + 1}`,
    objectType: object.objectType as Reference["objectType"],
    data: {},
    tempData: {},
    object,
    cell: list.cell,
    previousNode: list.tail ?? null,
    nextNode: null,
  };

  if (!list.head) {
    list.head = reference;
  }

  if (list.tail) {
    list.tail.nextNode = reference;
  }

  list.tail = reference;
  list.size += 1;

  return reference;
}

function cloneCells(source: Record<string, Cell>): Cell[] {
  return Object.values(source).map((cell) => ({
    ...cell,
    activators: createEmptyReferenceList(cell),
    actors: createEmptyReferenceList(cell),
    statics: createEmptyReferenceList(cell),
  }));
}

function cloneDialogueInfo(info: DialogueInfo): DialogueInfo {
  return { ...info };
}

function cloneDialogueRecord(source: Record<string, Dialogue>): Record<string, Dialogue> {
  return Object.fromEntries(
    Object.entries(source).map(([id, dialogue]) => [
      id,
      { ...dialogue, info: dialogue.info.map(cloneDialogueInfo) },
    ]),
  );
}

function cloneDialogues(source: DialogueRecordSet): DialogueRecordSet {
  return {
    greetings: cloneDialogueRecord(source.greetings),
    journals: source.journals ? cloneDialogueRecord(source.journals) : undefined,
    services: source.services ? cloneDialogueRecord(source.services) : undefined,
    topics: cloneDialogueRecord(source.topics),
  };
}

function createActions(): void {
  game.dataHandler.nonDynamicData.actions = ACTIONS.map((action) => ({ ...action }));
}

function createObjects(): void {
  game.dataHandler.nonDynamicData.objects = [
    ...Object.values(ALCHEMY).map((entry) => createAlchemy(entry)),
    ...Object.values(WEAPONS).map((entry) => createWeapon(entry)),
    ...Object.values(ARMORS).map((entry) => createArmor(entry)),
    ...Object.values(MISC_ITEMS).map((entry) => createMisc(entry)),
  ];
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
  game.dataHandler.nonDynamicData.dialogues = cloneDialogues(dialogues);
}

function createCells(): void {
  const clonedCells = cloneCells(cells);

  clonedCells.forEach((cell) => {
    const references = CELL_REFERENCES[cell.id];
    if (!references) return;

    references.activators.forEach((objectId: string) => {
      const object = game.dataHandler.nonDynamicData.objects.find((entry) => entry.id === objectId);
      if (object && cell.activators) {
        appendReference(cell.activators, object);
      }
    });

    references.actors.forEach((objectId: string) => {
      const object = game.dataHandler.nonDynamicData.objects.find((entry) => entry.id === objectId);
      if (object && cell.actors) {
        appendReference(cell.actors, object);
      }
    });

    references.statics.forEach((objectId: string) => {
      const object = game.dataHandler.nonDynamicData.objects.find((entry) => entry.id === objectId);
      if (object && cell.statics) {
        appendReference(cell.statics, object);
      }
    });
  });

  game.dataHandler.nonDynamicData.cells = clonedCells;
}

function createQuests(): void {
  game.worldController.quests = QUESTS.map((quest) => ({
    id: quest.id,
    objectType: OBJECT_TYPE.QUEST,
    dialogue: quest.dialogue.map((entry) => ({
      ...entry,
      dialogueType: DIALOGUE_TYPE.JOURNAL,
      objectType: OBJECT_TYPE.DIALOGUE,
      info: entry.info.map((info) => ({ ...info })),
      journalIndex: 0,
    })),
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
