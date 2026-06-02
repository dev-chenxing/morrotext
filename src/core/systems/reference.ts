import type { MobileActor, Reference } from "../../types.ts";
import { isMobileActor, isReference } from "../utils/objectType.ts";

function findReferenceById(identifier: string): Reference | undefined {
  // Search through mobManager's movingProps
  for (const reference of mt.worldController.mobManager.movingProps) {
    if (reference.id === identifier) {
      return reference;
    }
  }
}

export function resolveReference(
  reference: Reference | MobileActor | string,
): Reference | undefined {
  // First try to resolve the reference directly if it's already a Reference object
  if (isReference(reference)) {
    return reference;
  }

  // If it's a MobileActor, try to resolve it via its reference pointer
  if (isMobileActor(reference)) {
    if (reference.reference) {
      return reference.reference;
    }
  }

  // If it's a string, treat it as a reference ID and try to find it in the existing references
  if (typeof reference === "string") {
    const resolvedReference = findReferenceById(reference);
    if (!resolvedReference) {
      throw new Error(`Unknown reference: ${reference}`);
    }
    return resolvedReference;
  }

  throw new Error("Unable to resolve reference for positionCell().");
}
