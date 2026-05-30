import { OBJECT_TYPE } from "../constants.ts";

export interface BookRegistryEntry {
  id: string;
  name: string;
  objectType: OBJECT_TYPE.BOOK;
  value: number;
  description: string;
}

export const BOOKS: BookRegistryEntry[] = [
  {
    id: "bk_A1_1_DirectionsCaiusCosades",
    name: "Directions to Caius Cosades",
    objectType: OBJECT_TYPE.BOOK,
    value: 0,
    description: "A note from Glabrio Bellienus directing you to Caius Cosades in Balmora.",
  },
  {
    id: "bk_a1_1_caiuspackage",
    name: "Package for Caius Cosades",
    objectType: OBJECT_TYPE.BOOK,
    value: 0,
    description: "A sealed package containing ciphered Imperial correspondence.",
  },
];
