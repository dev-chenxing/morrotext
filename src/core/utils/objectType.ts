import type { MobileActor, Reference } from "../../types.ts";
import { OBJECT_TYPE } from "../../constants.ts";

export function isReference(value: unknown): value is Reference {
  return (
    typeof value === "object" &&
    value !== null &&
    "objectType" in value &&
    value.objectType === OBJECT_TYPE.REFERENCE
  );
}

export function isMobileActor(value: unknown): value is MobileActor {
  return (
    typeof value === "object" &&
    value !== null &&
    "objectType" in value &&
    (value.objectType === OBJECT_TYPE.MOBILE_ACTOR ||
      value.objectType === OBJECT_TYPE.MOBILE_CREATURE ||
      value.objectType === OBJECT_TYPE.MOBILE_NPC ||
      value.objectType === OBJECT_TYPE.MOBILE_PLAYER)
  );
}
