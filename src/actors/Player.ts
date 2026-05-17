import chalk from "chalk";
import { ATTRIBUTES, PLAYER_DEFAULTS, OBJECT_TYPE } from "../constants.ts";
import { getClass } from "../gameState.ts";
import { createClassActorProfile } from "../systems/class.ts";
import Actor from "./Actor.ts";
import type { ActiveQuest, Class, StoryFlags } from "../types.ts";

export class Player extends Actor {
  class: Class;
  skills: number[];
  activeQuests: ActiveQuest[];
  completedQuests: ActiveQuest[];
  storyFlags: StoryFlags;
  killCount: Record<string, number>;

  // Player-specific progression state
  levelUpProgress: number;

  constructor(name: string, classId: string) {
    // use a stable id for player
    super("player", name, PLAYER_DEFAULTS.LEVEL);
    this.objectType = OBJECT_TYPE.PLAYER;

    const selectedClass = getClass(classId);
    if (!selectedClass) {
      throw new Error(`Unknown class: ${classId}`);
    }

    if (!selectedClass.playable) {
      throw new Error(`Class is not playable: ${classId}`);
    }

    this.class = selectedClass;

    const classProfile = createClassActorProfile(this.class);
    this.skills = [...classProfile.skills];

    // Apply class-derived stats onto the Actor defaults
    this.health = { ...classProfile.health };
    this.magicka = { ...classProfile.magicka };
    this.strength = { ...classProfile.attributes[ATTRIBUTES.STRENGTH] };
    this.intelligence = { ...classProfile.attributes[ATTRIBUTES.INTELLIGENCE] };
    this.willpower = { ...classProfile.attributes[ATTRIBUTES.WILLPOWER] };
    this.agility = { ...classProfile.attributes[ATTRIBUTES.AGILITY] };
    this.speed = { ...classProfile.attributes[ATTRIBUTES.SPEED] };
    this.endurance = { ...classProfile.attributes[ATTRIBUTES.ENDURANCE] };
    this.personality = { ...classProfile.attributes[ATTRIBUTES.PERSONALITY] };
    this.luck = { ...classProfile.attributes[ATTRIBUTES.LUCK] };

    this.activeQuests = [];
    this.completedQuests = [];
    this.storyFlags = {};

    this.killCount = {};

    this.levelUpProgress = 0;
  }

  recordKill(enemyType: string) {
    if (!this.killCount[enemyType]) this.killCount[enemyType] = 0;
    this.killCount[enemyType]++;
  }

  levelUp() {
    super.levelUp();
    this.health.base += PLAYER_DEFAULTS.LEVEL_UP_HP_GAIN;
    this.health.current = this.health.base;
    console.log(chalk.yellow(`\n=== LEVEL UP! (${this.level}) ===`));
    console.log(`Max HP increased to ${this.health.base}`);
  }

  isItemEquipped(itemId: string) {
    return this.hasItemEquipped(itemId);
  }

  addExperience(xp: number) {
    this.levelUpProgress += xp;
    // Simple fixed threshold for level up; tweak later if desired
    const THRESHOLD = 10;
    while (this.levelUpProgress >= THRESHOLD) {
      this.levelUpProgress -= THRESHOLD;
      this.levelUp();
    }
  }
}
