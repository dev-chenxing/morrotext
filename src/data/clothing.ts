import { OBJECT_TYPE } from "../constants.ts";

export interface ClothingRegistryEntry {
  id: string;
  name: string;
  objectType: OBJECT_TYPE.CLOTHING;
  value: number;
  description: string;
}

export const CLOTHING: ClothingRegistryEntry[] = [
  {
    id: "common_shirt",
    name: "common shirt",
    objectType: OBJECT_TYPE.CLOTHING,
    value: 1,
    description: "A plain shirt issued to prisoners upon release.",
  },
  {
    id: "common_pants",
    name: "common pants",
    objectType: OBJECT_TYPE.CLOTHING,
    value: 1,
    description: "Simple trousers suitable for a newly released prisoner.",
  },
  {
    id: "common_shoes",
    name: "common shoes",
    objectType: OBJECT_TYPE.CLOTHING,
    value: 1,
    description: "Plain walking shoes with worn soles.",
  },
];
