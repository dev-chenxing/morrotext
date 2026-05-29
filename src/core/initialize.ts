import { DIALOGUE_TYPE, OBJECT_TYPE } from "../constants.ts";
import type { Dialogue, DialogueRecordSet } from "../types.ts";
import { ACTIONS } from "../data/actions.ts";
import { ALCHEMY } from "../data/alchemy.ts";
import { ARMORS } from "../data/armors.ts";
import { CELLS } from "../data/cells/index.ts";
import { CLASSES } from "../data/classes.ts";
import { CREATURES } from "../data/creatures.ts";
import dialogues from "../data/dialogues.ts";
import { MISC_ITEMS } from "../data/misc.ts";
import { NPC_REGISTRY } from "../data/npcs.ts";
import { QUESTS } from "../data/quests.ts";
import { WEAPONS } from "../data/weapons.ts";
import { createClass } from "./systems/class.ts";
import { createCell } from "./systems/cell.ts";
import { createCreature } from "./systems/creature.ts";
import {
  createAlchemy,
  createArmor,
  createMisc,
  createWeapon,
} from "./systems/item.ts";
import { createLeveledItems } from "./systems/leveledList.ts";
import { createNPC } from "./systems/npc.ts";
import { game } from "./gameState.ts";

function cloneDialogueRecord(
  source: Record<string, Dialogue>,
): Record<string, any> {
  return Object.fromEntries(
    Object.entries(source).map(([id, dialogue]) => [
      id,
      { ...dialogue, info: dialogue.info.map((info) => ({ ...info })) },
    ]),
  );
}

function cloneDialogues(source: DialogueRecordSet): any {
  return {
    greetings: cloneDialogueRecord(source.greetings),
    journals: source.journals
      ? cloneDialogueRecord(source.journals)
      : undefined,
    services: source.services
      ? cloneDialogueRecord(source.services)
      : undefined,
    topics: cloneDialogueRecord(source.topics),
  };
}

function createActions(): void {
  game.dataHandler.nonDynamicData.actions = ACTIONS.map((action) => ({
    ...action,
  }));
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
  game.dataHandler.nonDynamicData.objects.push(
    ...CREATURES.map((entry) => createCreature(entry)),
  );
}

function createClasses(): void {
  game.dataHandler.nonDynamicData.classes = CLASSES.map((entry) =>
    createClass(entry, game.dataHandler.nonDynamicData.actions),
  );
}

function createNPCs(): void {
  game.dataHandler.nonDynamicData.objects.push(
    ...NPC_REGISTRY.map((entry) =>
      createNPC(entry, game.dataHandler.nonDynamicData.classes),
    ),
  );
}

function createDialogues(): void {
  const cloned = cloneDialogues(dialogues);
  const arr: Dialogue[] = [];
  Object.values(cloned.greetings).forEach((d) =>
    arr.push(
      Object.assign({}, d, { type: DIALOGUE_TYPE.GREETING }) as Dialogue,
    ),
  );
  Object.values(cloned.topics).forEach((d) =>
    arr.push(Object.assign({}, d, { type: DIALOGUE_TYPE.TOPIC }) as Dialogue),
  );
  if (cloned.services)
    Object.values(cloned.services).forEach((d) =>
      arr.push(
        Object.assign({}, d, { type: DIALOGUE_TYPE.SERVICE }) as Dialogue,
      ),
    );
  if (cloned.journals)
    Object.values(cloned.journals).forEach((d) =>
      arr.push(
        Object.assign({}, d, { type: DIALOGUE_TYPE.JOURNAL }) as Dialogue,
      ),
    );

  game.dataHandler.nonDynamicData.dialogues = arr;
}

function createCells(): void {
  game.dataHandler.nonDynamicData.cells = CELLS.map((entry) => {
    const cell = createCell(
      entry,
      game.dataHandler.nonDynamicData.objects as any,
    );
    return cell;
  });
}

function createQuests(): void {
  game.worldController.quests = QUESTS.map((quest) => ({
    id: quest.id,
    objectType: OBJECT_TYPE.QUEST,
    dialogue: quest.dialogue.map((entry) => ({
      ...entry,
      type: DIALOGUE_TYPE.JOURNAL,
      objectType: OBJECT_TYPE.DIALOGUE,
      info: entry.info.map((info) => ({ ...info, id: quest.id })),
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
  createCells();
  createDialogues();
  createQuests();

  return game.dataHandler.nonDynamicData;
}
