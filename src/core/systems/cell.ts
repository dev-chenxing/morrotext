import chalk from "chalk";
import type {
  Cell,
  CellRegistryEntry,
  MobilePlayer,
  GameObject,
  Reference,
  ReferenceList,
  ValueOf,
} from "../../types.ts";
import { canTalkToActor, talkToNPC } from "./dialogue.ts";
import { createNPCInstance } from "./npc.ts";
import { select } from "../ui/prompt.ts";
import { OBJECT_TYPE } from "../../constants.ts";

export function appendReferenceToCell(reference: Reference, cell: Cell): void {
  if (!cell) {
    throw new Error("Missing cell data: cannot append reference to undefined cell.");
  }

  const referenceList = getReferenceListForObjectType(cell, reference.objectType);
  if (!referenceList) {
    throw new Error(`Cell does not have a reference list for object type: ${reference.objectType}`);
  }

  appendReference(referenceList, reference.object);
}

function getReferenceListForObjectType(
  cell: Cell,
  objectType: ValueOf<OBJECT_TYPE>,
): ReferenceList | null {
  switch (objectType) {
    case OBJECT_TYPE.ACTIVATOR:
      return cell.activators;
    case OBJECT_TYPE.NPC:
    case OBJECT_TYPE.CREATURE:
      return cell.actors;
    case OBJECT_TYPE.STATIC:
      return cell.statics;
    default:
      return null;
  }
}

function appendReference(list: ReferenceList, object: GameObject): Reference {
  const reference: Reference = {
    id: `${list.cell.id}:${object.id}:${list.size + 1}`,
    objectType: object.objectType as Reference["objectType"],
    data: {},
    tempData: {},
    object,
    cell: list.cell,
    previousNode: list.tail,
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

export function createReferenceList(cell: Cell, referenceList: string[]): ReferenceList {
  const list: ReferenceList = { cell, head: null, tail: null, size: 0 };

  referenceList.forEach((objectId) => {
    const object = mt.getObject(objectId);
    if (object) {
      appendReference(list, object);
    }
  });

  return list;
}

export function createCell(entry: CellRegistryEntry): Cell {
  const { activators, actors, statics, ...cellEntry } = entry;
  const cell = { ...cellEntry } as Cell;

  cell.description = cellEntry.description || "";
  cell.activators = createReferenceList(cell, activators);
  cell.actors = createReferenceList(cell, actors);
  cell.statics = createReferenceList(cell, statics);

  return cell;
}

export async function enterCell(player: MobilePlayer, cell: Cell): Promise<void> {
  if (!cell) {
    throw new Error("Missing cell data: cannot enter undefined cell.");
  }

  const description = cell.description || "";
  const displayName = cell.displayName ?? cell.editorName;
  let inCell = true; // Loop control flag for the cell interaction menu
  while (inCell && player.health.current > 0) {
    console.log(chalk.cyan(`\n=== ${displayName} ===`));
    console.log(chalk.red(description));
    const actorNodes: Reference[] = [];
    let currentActorNode = cell.actors?.head ?? null;
    while (currentActorNode) {
      actorNodes.push(currentActorNode);
      currentActorNode = currentActorNode.nextNode ?? null;
    }

    const talkableActors = actorNodes.filter((node) => canTalkToActor(node, player));

    const choices = [
      ...talkableActors.map((actorRef) => ({
        name: `Talk to ${mt.getObject((actorRef.object as any).id)?.name || (actorRef.object as any).id}`,
        value: { action: `npc:${(actorRef.object as any).id}` },
      })),
      { name: "Return to Travel Menu", value: { action: "return" } },
    ];

    const { action } = await select<{ action: string }>({
      message: "What would you like to do?",
      choices,
    });

    if (action.startsWith("npc:")) {
      const npcKey = action.split(":")[1];

      let node = cell.actors?.head ?? null;
      let foundRef: Reference | undefined;
      while (node) {
        const obj: any = node.object as any;
        if (obj && typeof obj.id === "string" && obj.id === npcKey) {
          foundRef = node;
          break;
        }
        node = node.nextNode ?? null;
      }

      if (foundRef) {
        await talkToNPC(foundRef, player);
      } else {
        await talkToNPC(createNPCInstance(npcKey), player);
      }

      await enterCell(player, cell);
      return;
    }

    inCell = false; // Player chose to leave the cell, exit the loop
  }
}
