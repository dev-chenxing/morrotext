import { SCRIPTS } from "../../data/scripts/index.ts";

export type Script = () => Promise<void> | void;

export type ScriptRegistryEntry = { id: string; run: Script };

export async function runScript(scriptId: string): Promise<void> {
  const script = SCRIPTS[scriptId];
  if (!script) {
    throw new Error(`Unknown script: ${scriptId}`);
  }

  await script();
}
