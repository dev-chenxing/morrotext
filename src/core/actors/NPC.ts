import Actor from "./Actor.ts";
import { OBJECT_TYPE, ATTRIBUTES, MERCHANT_SERVICE } from "../../constants.ts";
import type { AiConfig, Class, Action, ValueOf } from "../../types.ts";
import { createClassActorProfile } from "../systems/class.ts";
import { getClass } from "../gameState.ts";

export class NPC extends Actor {
  class: Class;
  aiConfig: AiConfig;
  actions: Action[];
  skills: number[];
  objectType: typeof OBJECT_TYPE.NPC;

  constructor(
    id: string,
    name: string,
    classId: string,
    level = 1,
    description = "",
    barterGold = 0,
    fight = 0,
  ) {
    super(id, name, level, description, fight);
    this.objectType = OBJECT_TYPE.NPC;

    const selectedClass = getClass(classId);
    if (!selectedClass) {
      throw new Error(`Unknown class: ${classId}`);
    }
    this.class = selectedClass;

    const profile = createClassActorProfile(this.class);

    this.strength = { ...profile.attributes[ATTRIBUTES.STRENGTH] };
    this.intelligence = { ...profile.attributes[ATTRIBUTES.INTELLIGENCE] };
    this.willpower = { ...profile.attributes[ATTRIBUTES.WILLPOWER] };
    this.agility = { ...profile.attributes[ATTRIBUTES.AGILITY] };
    this.speed = { ...profile.attributes[ATTRIBUTES.SPEED] };
    this.endurance = { ...profile.attributes[ATTRIBUTES.ENDURANCE] };
    this.personality = { ...profile.attributes[ATTRIBUTES.PERSONALITY] };
    this.luck = { ...profile.attributes[ATTRIBUTES.LUCK] };

    this.health = { ...profile.health };
    this.magicka = { ...profile.magicka };
    this.skills = [...profile.skills];
    this.actions = [...(this.class.actions ?? [])];

    this.barterGold = barterGold;

    // Build AI config from class defaults
    this.aiConfig = {
      barters: { ...this.class.barters },
      offers: { ...this.class.offers },
      fight: this.fight,
    } as AiConfig;
  }

  offersServices(service: ValueOf<typeof MERCHANT_SERVICE>) {
    return !!this.aiConfig.offers?.[
      service as ValueOf<typeof MERCHANT_SERVICE>
    ];
  }

  tradesItemType(objectType: ValueOf<typeof OBJECT_TYPE>) {
    return !!this.aiConfig.barters?.[objectType];
  }
}

export default NPC;
