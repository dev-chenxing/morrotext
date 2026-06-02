import { resolveReference } from "./reference.ts";
import { SCRIPTS } from "../../data/scripts/index.ts";
import type { MobileActor, Reference } from "../../types.ts";

export type Script = (reference?: Reference) => Promise<void> | void;

export type ScriptRegistryEntry = { id: string; run: Script };

export async function runScript(opts: {
  script: Script | string;
  reference?: Reference | MobileActor | string;
}): Promise<void> {
  const script = typeof opts.script === "string" ? SCRIPTS[opts.script] : opts.script;

  if (!script) {
    throw new Error(`Unknown script: ${String(opts.script)}`);
  }

  if (typeof opts.reference === "undefined") {
    await Promise.resolve(script());
    return;
  }

  const reference = resolveReference(opts.reference);
  if (!reference) {
    throw new Error(`Unable to resolve reference for script: ${String(opts.script)}`);
  }

  await Promise.resolve(script(reference));
}
