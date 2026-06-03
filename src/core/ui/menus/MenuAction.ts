import chalk from "chalk";
import type { Cell, Reference, ReferenceList } from "../../../types.ts";
import { select, type Choice } from "../prompt.ts";
import { talkToActor } from "../../systems/dialogue.ts";

type ActionChoice =
  | { action: "look" }
  | { action: "interact" }
  | { action: "walk" }
  | { action: "return" };

type InteractionChoice =
  | { action: "npc"; referenceId: string }
  | { action: "door"; destination: string }
  | { action: "activator"; referenceId: string }
  | { action: "static"; referenceId: string }
  | { action: "cancel" };

type DoorLink = { name: string; destination: string };

const CELL_DOOR_LINKS: Record<string, DoorLink[]> = {
  "Imperial Prison Ship": [
    { name: "Hatch to the dock", destination: "Seyda Neen, Census and Excise Office" },
  ],
  "Seyda Neen, Census and Excise Office": [
    { name: "Front door", destination: "Seyda Neen" },
    { name: "Gangway back to the ship", destination: "Imperial Prison Ship" },
  ],
  "Seyda Neen": [
    { name: "Census and Excise Office door", destination: "Seyda Neen, Census and Excise Office" },
  ],
};

function toArray(list: ReferenceList): Reference[] {
  const values: Reference[] = [];
  let node = list.head;
  while (node) {
    values.push(node);
    node = node.nextNode ?? null;
  }
  return values;
}

function getReferenceName(reference: Reference): string {
  const object = reference.object as { name?: string; id?: string };
  return object.name ?? object.id ?? reference.id;
}

function listCellObjects(cell: Cell): {
  actors: Reference[];
  activators: Reference[];
  statics: Reference[];
  doors: DoorLink[];
} {
  return {
    actors: toArray(cell.actors),
    activators: toArray(cell.activators),
    statics: toArray(cell.statics),
    doors: CELL_DOOR_LINKS[cell.id] ?? [],
  };
}

function lookAround(cell: Cell): void {
  const displayName = cell.displayName ?? cell.editorName;
  const objects = listCellObjects(cell);

  console.log(chalk.cyan(`\n=== ${displayName} ===`));
  if (cell.description) {
    console.log(chalk.red(cell.description));
  } else {
    console.log(chalk.gray("Nothing notable catches your eye."));
  }

  if (objects.actors.length > 0) {
    console.log(chalk.yellow("\nPeople nearby:"));
    for (const actor of objects.actors) {
      console.log(`- ${getReferenceName(actor)}`);
    }
  }

  if (objects.doors.length > 0) {
    console.log(chalk.yellow("\nDoors and exits:"));
    for (const door of objects.doors) {
      const destination = mt.getCell(door.destination);
      const destinationName = destination
        ? (destination.displayName ?? destination.editorName)
        : door.destination;
      console.log(`- ${door.name} -> ${destinationName}`);
    }
  }

  if (objects.activators.length > 0 || objects.statics.length > 0) {
    console.log(chalk.yellow("\nOther objects:"));
    for (const objectRef of [...objects.activators, ...objects.statics]) {
      console.log(`- ${getReferenceName(objectRef)}`);
    }
  }
}

async function showWalkMenu(): Promise<void> {
  const currentCell = mt.player.cell;
  if (!currentCell) {
    console.log(chalk.red("You are nowhere. Movement is unavailable."));
    return;
  }

  if (currentCell.isInterior) {
    console.log(
      chalk.gray("You cannot freely walk world cells from an interior. Use a door instead."),
    );
    return;
  }

  const exteriorCells = mt.dataHandler.nonDynamicData.cells.filter((cell) => !cell.isInterior);
  const destinations = exteriorCells.filter((cell) => cell.id !== currentCell.id);

  if (destinations.length === 0) {
    console.log(chalk.gray("No other exterior cells are currently available."));
    return;
  }

  const { destination } = await select<{ destination: string | null }>({
    message: "Where do you want to walk?",
    choices: [
      ...destinations.map((cell) => ({
        name: cell.displayName ?? cell.editorName,
        value: { destination: cell.id },
      })),
      { name: "Cancel", value: { destination: null } },
    ],
  });

  if (!destination) {
    return;
  }

  const nextCell = mt.getCell(destination);
  if (!nextCell) {
    console.log(chalk.red("Unknown destination."));
    return;
  }

  mt.player.cell = nextCell;
  console.log(chalk.green(`\nYou walk to ${nextCell.displayName ?? nextCell.editorName}.`));
}

async function showInteractionMenu(): Promise<void> {
  const cell = mt.player.cell;
  if (!cell) {
    console.log(chalk.red("There is nothing to interact with here."));
    return;
  }

  const { actors, activators, statics, doors } = listCellObjects(cell);

  const choices: Array<{ name: string; value: InteractionChoice }> = [
    ...actors.map((reference) => ({
      name: `Talk to ${getReferenceName(reference)}`,
      value: { action: "npc", referenceId: reference.id } as InteractionChoice,
    })),
    ...doors.map((door) => {
      const destination = mt.getCell(door.destination);
      const destinationName = destination
        ? (destination.displayName ?? destination.editorName)
        : door.destination;
      return {
        name: `${door.name} (${destinationName})`,
        value: { action: "door", destination: door.destination } as InteractionChoice,
      };
    }),
    ...activators.map((reference) => ({
      name: `Use ${getReferenceName(reference)}`,
      value: { action: "activator", referenceId: reference.id } as InteractionChoice,
    })),
    ...statics.map((reference) => ({
      name: `Examine ${getReferenceName(reference)}`,
      value: { action: "static", referenceId: reference.id } as InteractionChoice,
    })),
    { name: "Cancel", value: { action: "cancel" } },
  ];

  if (choices.length === 1) {
    console.log(chalk.gray("There are no interactable objects here yet."));
    return;
  }

  const interaction = await select<InteractionChoice>({ message: "Interact with:", choices });

  if (interaction.action === "cancel") {
    return;
  }

  if (interaction.action === "door") {
    const destination = mt.getCell(interaction.destination);
    if (!destination) {
      console.log(chalk.red("That door seems jammed."));
      return;
    }
    mt.player.cell = destination;
    console.log(
      chalk.green(
        `\nYou pass through and enter ${destination.displayName ?? destination.editorName}.`,
      ),
    );
    return;
  }

  const allReferences = [...actors, ...activators, ...statics];
  const targetRef = allReferences.find((reference) => reference.id === interaction.referenceId);
  if (!targetRef) {
    console.log(chalk.red("You cannot reach that object."));
    return;
  }

  if (interaction.action === "npc") {
    await talkToActor(targetRef);
    return;
  }

  console.log(chalk.gray("You inspect it, but nothing else happens yet."));
}

export async function showActionMenu(): Promise<void> {
  while (true) {
    const cell = mt.player.cell;
    if (!cell) {
      throw new Error("Player is not in any cell. Cannot show action menu.");
    }

    const choices: Choice<ActionChoice>[] = [
      { name: "Look around", value: { action: "look" } },
      { name: "Interact with nearby objects", value: { action: "interact" } },
      { name: "Return to Main Menu", value: { action: "return" } },
    ];

    if (!cell.isInterior) {
      choices.splice(2, 0, { name: "Walk to another location", value: { action: "walk" } });
    }

    const cellName = cell.displayName ?? cell.editorName;
    const { action } = await select<ActionChoice>({
      prefix: chalk.cyan(`\n=== ${cellName} ===\n`),
      message: cell.description,
      choices,
    });

    if (action === "return") {
      return;
    }

    if (action === "look") {
      lookAround(cell);
      continue;
    }

    if (action === "interact") {
      await showInteractionMenu();
      continue;
    }

    await showWalkMenu();
  }
}
