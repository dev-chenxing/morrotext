import { readdir } from "node:fs/promises";
import { dirname, extname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import type { CellRegistryEntry } from "../../types.ts";

function isCellRegistryEntry(value: unknown): value is CellRegistryEntry {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Partial<CellRegistryEntry>;

  return (
    typeof candidate.id === "string" &&
    typeof candidate.editorName === "string" &&
    typeof candidate.displayName === "string" &&
    (candidate.description === undefined || typeof candidate.description === "string") &&
    Array.isArray(candidate.activators) &&
    candidate.activators.every((entry) => typeof entry === "string") &&
    Array.isArray(candidate.actors) &&
    candidate.actors.every((entry) => typeof entry === "string") &&
    Array.isArray(candidate.statics) &&
    candidate.statics.every((entry) => typeof entry === "string")
  );
}

async function loadCellRegistryEntries(): Promise<CellRegistryEntry[]> {
  const directoryPath = dirname(fileURLToPath(import.meta.url));
  const directoryEntries = await readdir(directoryPath, { withFileTypes: true });

  const modulePaths = directoryEntries
    .filter((entry) => entry.isFile() && extname(entry.name) === ".ts" && entry.name !== "index.ts")
    .map((entry) => pathToFileURL(join(directoryPath, entry.name)).href);

  const loadedEntries = await Promise.all(
    modulePaths.map(async (modulePath) => {
      const imported = await import(modulePath);
      return isCellRegistryEntry(imported.default) ? imported.default : null;
    }),
  );

  return loadedEntries.filter((entry): entry is CellRegistryEntry => entry !== null);
}

export const CELLS = await loadCellRegistryEntries();
