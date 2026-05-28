import { readdir } from "node:fs/promises";
import { dirname, extname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import type { Cell } from "../../types.ts";

export type CellRegistryEntry = {
  cell: Cell;
  activators: string[];
  actors: string[];
  statics: string[];
};

function isCellRegistryEntry(value: unknown): value is CellRegistryEntry {
  return (
    typeof value === "object" &&
    value !== null &&
    "cell" in value &&
    "activators" in value &&
    "actors" in value &&
    "statics" in value
  );
}

async function loadCellRegistryEntries(): Promise<CellRegistryEntry[]> {
  const directoryPath = dirname(fileURLToPath(import.meta.url));
  const directoryEntries = await readdir(directoryPath, { withFileTypes: true });

  const modulePaths = directoryEntries
    .filter(
      (entry) => entry.isFile() && extname(entry.name) === ".ts" && entry.name !== "index.ts",
    )
    .map((entry) => pathToFileURL(join(directoryPath, entry.name)).href);

  const loadedEntries = await Promise.all(
    modulePaths.map(async (modulePath) => {
      const imported = await import(modulePath);
      return isCellRegistryEntry(imported.default) ? imported.default : null;
    }),
  );

  return loadedEntries.filter((entry): entry is CellRegistryEntry => entry !== null);
}

export const CELL_REGISTRY_ENTRIES = await loadCellRegistryEntries();

export const cells: Record<string, Cell> = Object.fromEntries(
  CELL_REGISTRY_ENTRIES.map(({ cell }) => [cell.id, cell]),
) as Record<string, Cell>;

export const CELL_REFERENCES: Record<
  string,
  Pick<CellRegistryEntry, "activators" | "actors" | "statics">
> = Object.fromEntries(
  CELL_REGISTRY_ENTRIES.map(({ cell, activators, actors, statics }) => [
    cell.id,
    { activators, actors, statics },
  ]),
);
