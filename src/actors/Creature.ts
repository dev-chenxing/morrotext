import Actor from "./Actor.ts";
import { CREATURE_TYPE, OBJECT_TYPE } from "../constants.ts";
import type { ValueOf } from "../types.ts";

export class Creature extends Actor {
  // Creature-specific field
  type: ValueOf<typeof CREATURE_TYPE>;

  constructor(
    id: string,
    name: string,
    type: ValueOf<typeof CREATURE_TYPE> = CREATURE_TYPE.NORMAL,
    level = 1,
  ) {
    // Actor constructor handles description/fight defaults
    super(id, name, level);
    this.type = type;
    this.objectType = OBJECT_TYPE.CREATURE;
  }
}

export default Creature;
