import { DIALOGUE_TYPE, OBJECT_TYPE } from "../constants.ts";
import type { Actor, Dialogue, DialogueInfo } from "../types.ts";
import { ACTIONS } from "../data/actions.ts";
import { ALCHEMY } from "../data/alchemy.ts";
import { ARMORS } from "../data/armors.ts";
import { CELLS } from "../data/cells/index.ts";
import { CLASSES } from "../data/classes.ts";
import { CREATURES } from "../data/creatures.ts";
import {
  type DialogueInfoRegistryEntry,
  type DialogueRegistryEntry,
  DIALOGUE,
} from "../data/dialogues.ts";
import { MISC_ITEMS } from "../data/misc.ts";
import { NPC_REGISTRY } from "../data/npcs.ts";
import { JOURNAL } from "../data/quests.ts";
import { WEAPONS } from "../data/weapons.ts";
import { createClass } from "./systems/class.ts";
import { createCell } from "./systems/cell.ts";
import { createCreature } from "./systems/creature.ts";
import { createAlchemy, createArmor, createMisc, createWeapon } from "./systems/item.ts";
import { createLeveledItems } from "./systems/leveledList.ts";
import { createNPC } from "./systems/npc.ts";
import { createQuest } from "./systems/quest.ts";
import { hashString, stableSerialize } from "./utils/index.ts";
import { attachMtGlobal, mt } from "./mt.ts";

function createDialogueInfoId(dialogueId: string, info: DialogueInfoRegistryEntry): string {
  // Create a unique ID for the dialogue info by hashing its content along with the parent dialogue ID
  const baseString = `${dialogueId}-${stableSerialize(info)}`;
  return hashString(baseString);
}

function createDialogueInfo(dialogueId: string, info: DialogueInfoRegistryEntry): DialogueInfo {
  return {
    ...info,
    actor: info.actor ? (mt.getObject(info.actor) as Actor | undefined) : undefined,
    id: createDialogueInfoId(dialogueId, info),
  };
}

function createDialogueEntries(
  entries: DialogueRegistryEntry[],
  type: Dialogue["type"],
): Dialogue[] {
  return entries.map((entry) => ({
    id: entry.id,
    objectType: OBJECT_TYPE.DIALOGUE,
    type,
    info: entry.info.map((info) => createDialogueInfo(entry.id, info)),
  }));
}

function createActions(): void {
  mt.dataHandler.nonDynamicData.actions = ACTIONS.map((action) => ({ ...action }));
}

function createObjects(): void {
  mt.dataHandler.nonDynamicData.objects = [
    ...Object.values(ALCHEMY).map((entry) => createAlchemy(entry)),
    ...Object.values(WEAPONS).map((entry) => createWeapon(entry)),
    ...Object.values(ARMORS).map((entry) => createArmor(entry)),
    ...Object.values(MISC_ITEMS).map((entry) => createMisc(entry)),
  ];
}

function createCreatures(): void {
  mt.dataHandler.nonDynamicData.objects.push(...CREATURES.map((entry) => createCreature(entry)));
}

function createClasses(): void {
  mt.dataHandler.nonDynamicData.classes = CLASSES.map((entry) =>
    createClass(entry, mt.dataHandler.nonDynamicData.actions),
  );
}

function createNPCs(): void {
  mt.dataHandler.nonDynamicData.objects.push(
    ...NPC_REGISTRY.map((entry) => createNPC(entry, mt.dataHandler.nonDynamicData.classes)),
  );
}

function createDialogues(): void {
  mt.dataHandler.nonDynamicData.dialogues = [
    ...createDialogueEntries(DIALOGUE.GREETING, DIALOGUE_TYPE.GREETING),
    ...createDialogueEntries(DIALOGUE.TOPIC, DIALOGUE_TYPE.TOPIC),
  ];
}

function createCells(): void {
  mt.dataHandler.nonDynamicData.cells = CELLS.map((entry) => {
    const cell = createCell(entry);
    return cell;
  });
}

function createQuests(): void {
  mt.worldController.quests = JOURNAL.map((q) => createQuest(q));
}

export function initializeGameData() {
  attachMtGlobal();

  if (mt.dataHandler.nonDynamicData.actions.length > 0) {
    return mt.dataHandler.nonDynamicData;
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

  return mt.dataHandler.nonDynamicData;
}
