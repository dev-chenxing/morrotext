import type { Player } from "./actors/Player.ts";
import type {
  Action,
  Cell,
  Class,
  Creature,
  Dialogue,
  Item,
  MobileActor,
  NPC,
  Quest,
} from "./types.ts";

export type NonDynamicData = {
  actions: Action[];
  cells: Cell[];
  classes: Class[];
  creatures: Creature[];
  dialogues: Dialogue[];
  npcs: NPC[];
  objects: Item[];
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
      creatures: [],
      dialogues: [],
      npcs: [],
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
