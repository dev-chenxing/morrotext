import chalk from "chalk";
import type { MobilePlayer } from "../../../types.ts";
import { enterCell } from "../../systems/cell.ts";
import { select } from "../prompt.ts";

export async function showServiceTravelMenu(player: MobilePlayer): Promise<void> {
  while (true) {
    const availableCells = mt.dataHandler.nonDynamicData.cells;

    const choices = availableCells.map((loc) => ({
      name: loc.displayName ?? loc.editorName,
      value: { destination: loc.id },
    }));

    const { destination } = await select<{ destination: string | null }>({
      message: "Where would you like to travel?",
      choices: [...choices, { name: "Return to Main Menu", value: { destination: null } }],
    });

    if (destination === null) return;

    const selectedCell = mt.dataHandler.nonDynamicData.cells.find((loc) => loc.id === destination);
    if (!selectedCell) {
      console.log(chalk.red("Unknown destination selected."));
      continue;
    }

    console.log(
      chalk.yellow(`\nTraveling to ${selectedCell.displayName ?? selectedCell.editorName}...`),
    );
    await enterCell(player, selectedCell);
  }
}
