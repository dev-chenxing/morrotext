import type { Cell, CellRegistryEntry, GameObject, Reference, ReferenceList } from "../../types.ts";

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

  cell.activators = createReferenceList(cell, activators);
  cell.actors = createReferenceList(cell, actors);
  cell.statics = createReferenceList(cell, statics);

  return cell;
}
