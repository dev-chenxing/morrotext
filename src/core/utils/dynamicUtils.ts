import type { Player } from "../actors/Player.ts";
import type { DynamicValue } from "../../types.ts";

export function resolveDynamic<T>(
  property: DynamicValue<T> | undefined,
  player: Player,
): T | undefined {
  if (typeof property === "function") {
    return (property as (player: Player) => T)(player);
  }

  return property;
}
