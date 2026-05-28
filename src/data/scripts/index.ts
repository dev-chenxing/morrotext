import { readdir } from "node:fs/promises";
import { dirname, extname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import type { DataScript, DataScriptRegistryEntry } from "../../core/systems/script.ts";

function isDataScriptRegistryEntry(value: unknown): value is DataScriptRegistryEntry {
  return typeof value === "object" && value !== null && "id" in value && "run" in value;
}

async function loadDataScriptEntries(): Promise<DataScriptRegistryEntry[]> {
  const directoryPath = dirname(fileURLToPath(import.meta.url));
  const directoryEntries = await readdir(directoryPath, { withFileTypes: true });

  const modulePaths = directoryEntries
    .filter((entry) => entry.isFile() && extname(entry.name) === ".ts" && entry.name !== "index.ts")
    .map((entry) => pathToFileURL(join(directoryPath, entry.name)).href);

  const loadedEntries = await Promise.all(
    modulePaths.map(async (modulePath) => {
      const imported = await import(modulePath);
      return isDataScriptRegistryEntry(imported.default) ? imported.default : null;
    }),
  );

  return loadedEntries.filter((entry): entry is DataScriptRegistryEntry => entry !== null);
}

export const DATA_SCRIPT_ENTRIES = await loadDataScriptEntries();

export const DATA_SCRIPTS: Record<string, DataScript> = Object.fromEntries(
  DATA_SCRIPT_ENTRIES.map((entry) => [entry.id, entry.run]),
);
