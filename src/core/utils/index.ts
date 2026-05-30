import type { DynamicValue } from "../../types.ts";
import type { MobilePlayer } from "../../types.ts";

export function hashString(value: string): string {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return (hash >>> 0).toString(36);
}
export function resolveDynamic<T>(
  property: DynamicValue<T> | undefined,
  player: MobilePlayer,
): T | undefined {
  if (typeof property === "function") {
    return (property as (player: MobilePlayer) => T)(player);
  }

  return property;
}

export function stableSerialize(value: unknown): string {
  if (value === null) {
    return "null";
  }

  if (typeof value === "function") {
    return value.toString();
  }

  if (typeof value !== "object") {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map((item) => stableSerialize(item)).join(",")}]`;
  }

  const entries = Object.entries(value).sort(([left], [right]) => left.localeCompare(right));
  return `{${entries
    .map(([key, entryValue]) => `${JSON.stringify(key)}:${stableSerialize(entryValue)}`)
    .join(",")}}`;
}
