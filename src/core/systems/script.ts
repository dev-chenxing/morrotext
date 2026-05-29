import type { MobilePlayer } from "../../types.ts";
import { DATA_SCRIPTS } from "../../data/scripts/index.ts";

export type DataScriptContext = { player: MobilePlayer };

export type DataScript = (context: DataScriptContext) => Promise<void> | void;

export type DataScriptRegistryEntry = { id: string; run: DataScript };

export async function runDataScript(scriptId: string, context: DataScriptContext): Promise<void> {
  const script = DATA_SCRIPTS[scriptId];
  if (!script) {
    throw new Error(`Unknown data script: ${scriptId}`);
  }

  await script(context);
}
