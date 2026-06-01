import { readdir } from "node:fs/promises";
import { dirname, extname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import type { Script, ScriptRegistryEntry } from "../../core/systems/script.ts";

function isScriptRegistryEntry(value: unknown): value is ScriptRegistryEntry {
  return typeof value === "object" && value !== null && "id" in value && "run" in value;
}

async function loadScriptEntries(): Promise<ScriptRegistryEntry[]> {
  const directoryPath = dirname(fileURLToPath(import.meta.url));
  const directoryEntries = await readdir(directoryPath, { withFileTypes: true });

  const modulePaths = directoryEntries
    .filter((entry) => entry.isFile() && extname(entry.name) === ".ts" && entry.name !== "index.ts")
    .map((entry) => pathToFileURL(join(directoryPath, entry.name)).href);

  const loadedEntries = await Promise.all(
    modulePaths.map(async (modulePath) => {
      const imported = await import(modulePath);
      return isScriptRegistryEntry(imported.default) ? imported.default : null;
    }),
  );

  return loadedEntries.filter((entry): entry is ScriptRegistryEntry => entry !== null);
}

export const SCRIPT_ENTRIES = await loadScriptEntries();

export const SCRIPTS: Record<string, Script> = Object.fromEntries(
  SCRIPT_ENTRIES.map((entry) => [entry.id, entry.run]),
);
