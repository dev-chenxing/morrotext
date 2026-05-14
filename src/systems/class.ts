import { ATTRIBUTES, OBJECT_TYPE, MERCHANT_SERVICE, SKILL } from "../constants.ts";
import type { Action, Class, Statistic, ValueOf } from "../types.ts";
import type { ClassEntry } from "../world/classes.ts";

const DEFAULT_ATTRIBUTE_VALUE = 5;
const FAVORED_ATTRIBUTE_BONUS = 10;
const DEFAULT_SKILL_VALUE = 5;
const MINOR_SKILL_BONUS = 10;
const MAJOR_SKILL_BONUS = 25;

export type ClassActorProfile = {
  attributes: Record<ValueOf<typeof ATTRIBUTES>, Statistic>;
  skills: number[];
  health: Statistic;
  magicka: Statistic;
};

function createAttributeStatistics(
  selectedAttributes: ValueOf<typeof ATTRIBUTES>[] = [],
): Record<ValueOf<typeof ATTRIBUTES>, Statistic> {
  return Object.values(ATTRIBUTES).reduce(
    (acc, attribute) => {
      const base = selectedAttributes.includes(attribute)
        ? DEFAULT_ATTRIBUTE_VALUE + FAVORED_ATTRIBUTE_BONUS
        : DEFAULT_ATTRIBUTE_VALUE;
      acc[attribute] = {
        base,
        current: base,
      };
      return acc;
    },
    {} as Record<ValueOf<typeof ATTRIBUTES>, Statistic>,
  );
}

function createSkillValues(
  majorSkills: ValueOf<typeof SKILL>[] = [],
  minorSkills: ValueOf<typeof SKILL>[] = [],
): number[] {
  const skillCount = Object.keys(SKILL).length;
  const skills = Array.from({ length: skillCount }, () => DEFAULT_SKILL_VALUE);

  majorSkills.forEach((skillId) => {
    skills[skillId] += MAJOR_SKILL_BONUS;
  });

  minorSkills.forEach((skillId) => {
    skills[skillId] += MINOR_SKILL_BONUS;
  });

  return skills;
}

export function createClassActorProfile(
  gameClass: Pick<Class, "attributes" | "majorSkills" | "minorSkills">,
): ClassActorProfile {
  const attributes = createAttributeStatistics(gameClass.attributes);
  const healthBase =
    (attributes[ATTRIBUTES.STRENGTH].base + attributes[ATTRIBUTES.ENDURANCE].base) / 2;
  const magickaBase = attributes[ATTRIBUTES.INTELLIGENCE].base;

  return {
    attributes,
    skills: createSkillValues(gameClass.majorSkills, gameClass.minorSkills),
    health: {
      base: healthBase,
      current: healthBase,
    },
    magicka: {
      base: magickaBase,
      current: magickaBase,
    },
  };
}

export function createClass(entry: ClassEntry, actionRegistry: Action[] = []): Class {
  const Barters: Record<ValueOf<typeof OBJECT_TYPE>, boolean> = Object.values(OBJECT_TYPE).reduce(
    (acc, key) => {
      acc[key as ValueOf<typeof OBJECT_TYPE>] =
        entry.barters?.[key as ValueOf<typeof OBJECT_TYPE>] ?? false;
      return acc;
    },
    {} as Record<ValueOf<typeof OBJECT_TYPE>, boolean>,
  );

  const Offers: Record<ValueOf<typeof MERCHANT_SERVICE>, boolean> = Object.values(
    MERCHANT_SERVICE,
  ).reduce(
    (acc, key) => {
      acc[key as ValueOf<typeof MERCHANT_SERVICE>] =
        entry.offers?.[key as ValueOf<typeof MERCHANT_SERVICE>] ?? false;
      return acc;
    },
    {} as Record<ValueOf<typeof MERCHANT_SERVICE>, boolean>,
  );

  return {
    id: entry.id,
    objectType: OBJECT_TYPE.ACTOR,
    name: entry.name,
    attributes: [...(entry.attributes ?? [])],
    majorSkills: [...(entry.majorSkills ?? [])],
    minorSkills: [...(entry.minorSkills ?? [])],
    startingItems: entry.startingItems ?? [],
    actions: (entry.actions ?? [])
      .map((actionId) => actionRegistry.find((action) => action.id === actionId))
      .filter((action): action is Action => Boolean(action)),
    barters: Barters,
    offers: Offers,
    description: entry.description,
    playable: entry.playable,
  };
}
