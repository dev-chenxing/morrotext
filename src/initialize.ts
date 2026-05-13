import npcDialogues from "./content/dialogues.ts";
import { game } from "./gameState.ts";
import { createClass } from "./systems/class.ts";
import type { Action, Area, Class, Dialogue, Item, NPC } from "./types.ts";
import { ACTIONS } from "./world/actions.ts";
import { areas } from "./world/areas.ts";
import { CLASSES } from "./world/classes.ts";
import { createCreature, CREATURES } from "./world/creatures.ts";
import { ITEMS } from "./world/items.ts";
import { createNPC, NPC_REGISTRY } from "./world/npcs.ts";

function cloneAreas(source: Record<string, Area>): Area[] {
  return Object.values(source).map((area) => ({
    ...area,
    npcs: [...area.npcs],
    quests: area.quests ? [...area.quests] : undefined,
  }));
}

function cloneDialogues(source: Record<string, Dialogue>): Dialogue[] {
  return Object.values(source).map((dialogue) => ({
    ...dialogue,
    dialogues: Object.fromEntries(
      Object.entries(dialogue.dialogues).map(([stateKey, state]) => [
        stateKey,
        {
          ...state,
          options: state.options.map((option) => ({ ...option })),
        },
      ]),
    ),
  }));
}

function createActionRegistry(): Action[] {
  return ACTIONS.map((action) => ({ ...action }));
}

function createObjectRegistry(): Item[] {
  return Object.values(ITEMS).map((item) => ({ ...item }));
}

function createCreatureRegistry() {
  return CREATURES.map((entry) => createCreature(entry));
}

function createClassRegistry(actions: Action[]): Class[] {
  return CLASSES.map((entry) => createClass(entry, actions));
}

function createNPCRegistry(classes: Class[]): NPC[] {
  return NPC_REGISTRY.map((entry) => createNPC(entry, classes));
}

export function initializeGameData() {
  if (game.dataHandler.nonDynamicData.actions.length > 0) {
    return game.dataHandler.nonDynamicData;
  }

  const actions = createActionRegistry();
  const objects = createObjectRegistry();
  const creatures = createCreatureRegistry();
  const classes = createClassRegistry(actions);
  const npcs = createNPCRegistry(classes);
  const dialogues = cloneDialogues(npcDialogues);
  const hydratedAreas = cloneAreas(areas);

  game.dataHandler.nonDynamicData = {
    actions,
    areas: hydratedAreas,
    classes,
    creatures,
    dialogues,
    npcs,
    objects,
  };

  return game.dataHandler.nonDynamicData;
}
