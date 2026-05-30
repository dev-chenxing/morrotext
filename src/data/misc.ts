import type { MiscRegistryEntry } from "../types.ts";
import { OBJECT_TYPE } from "../constants.ts";

export const MISC_ITEMS: Record<string, MiscRegistryEntry> = {
  gold: {
    id: "Gold_001",
    name: "Gold",
    objectType: OBJECT_TYPE.MISC_ITEM,
    value: 1,
    description: "A single gold coin.",
  },
};
