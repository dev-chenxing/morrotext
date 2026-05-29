import type {
  Cell,
  CellRegistryEntry,
  GameObject,
  Reference,
  ReferenceList,
} from "../../types.ts";

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

export function createReferenceList(
  cell: Cell,
  objectIds: string[],
  objectsById: ReadonlyMap<string, GameObject>,
): ReferenceList {
  const list: ReferenceList = { cell, head: null, tail: null, size: 0 };

  objectIds.forEach((objectId) => {
    const object = objectsById.get(objectId);
    if (object) {
      appendReference(list, object);
    }
  });

  return list;
}

// Batch creation moved to initialize to follow the createX pattern there.

export function createCell(
  entry: CellRegistryEntry,
  objects: GameObject[] | ReadonlyMap<string, GameObject>,
): Cell {
  let objectsById: ReadonlyMap<string, GameObject>;
  if (objects instanceof Map) {
    objectsById = objects as ReadonlyMap<string, GameObject>;
  } else {
    const arr = objects as GameObject[];
    objectsById = new Map(arr.map((o) => [o.id, o]));
  }

  const { activators, actors, statics, ...cellEntry } = entry;
  const cell = { ...cellEntry } as Cell;

  cell.activators = createReferenceList(cell, activators, objectsById);
  cell.actors = createReferenceList(cell, actors, objectsById);
  cell.statics = createReferenceList(cell, statics, objectsById);

  return cell;
}
