import { PROGRESSION } from "../constants.ts";

export const EXP_LEVELS = [
    0, // Level 1
    200, // Level 2
    500, // Level 3
    1000, // Level 4
    1500 // Level 5
];

export function getNextLevelExp(level: number): number | typeof PROGRESSION.MAX_LEVEL_LABEL {
    return level < EXP_LEVELS.length ? EXP_LEVELS[level] : PROGRESSION.MAX_LEVEL_LABEL;
}