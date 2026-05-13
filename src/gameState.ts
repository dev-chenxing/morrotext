import type { Player } from "./actors/Player.ts";
import type { Action, Area, Class, Creature, Dialogue, Item, NPC } from "./types.ts";

export type NonDynamicData = {
  actions: Action[];
  areas: Area[];
  classes: Class[];
  creatures: Creature[];
  dialogues: Dialogue[];
  npcs: NPC[];
  objects: Item[];
};

export const game: {
  player: Player | null;
  dataHandler: {
    nonDynamicData: NonDynamicData;
  };
} = {
  player: null,
  dataHandler: {
    nonDynamicData: {
      actions: [],
      areas: [],
      classes: [],
      creatures: [],
      dialogues: [],
      npcs: [],
      objects: [],
    },
  },
};

export function getNonDynamicData(): NonDynamicData {
  return game.dataHandler.nonDynamicData;
}

export function getAction(actionId: string): Action | undefined {
  return getNonDynamicData().actions.find((action) => action.id === actionId);
}

export function getArea(areaId: string): Area | undefined {
  return getNonDynamicData().areas.find((area) => area.id === areaId);
}

export function getClass(classId: string): Class | undefined {
  return getNonDynamicData().classes.find((gameClass) => gameClass.id === classId);
}

export function getCreature(creatureId: string): Creature | undefined {
  return getNonDynamicData().creatures.find((creature) => creature.id === creatureId);
}

export function getDialogue(dialogueId: string): Dialogue | undefined {
  return getNonDynamicData().dialogues.find((dialogue) => dialogue.id === dialogueId);
}

export function getNPC(npcId: string): NPC | undefined {
  return getNonDynamicData().npcs.find((npc) => npc.id === npcId);
}

export function getObject(objectId: string): Item | undefined {
  return getNonDynamicData().objects.find((item) => item.id === objectId);
}
