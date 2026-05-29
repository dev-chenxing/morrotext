import type { DynamicValue } from "../../types.ts";
import type { MobilePlayer } from "../../types.ts";

export function resolveDynamic<T>(
  property: DynamicValue<T> | undefined,
  player: MobilePlayer,
): T | undefined {
  if (typeof property === "function") {
    return (property as (player: MobilePlayer) => T)(player);
  }

  return property;
}
