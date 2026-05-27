import { describe, expect, it } from "vitest";
import { Player } from "../core/actors/Player.ts";
import { initializeGameData } from "../core/initialize.ts";

describe("player progression", () => {
  it("uses the shared actor default level for new players", () => {
    initializeGameData();

    const player = new Player("Tester", "warrior");

    expect(player.level).toBe(1);
  });

  it("increases max HP by 10% of Endurance on level up", () => {
    initializeGameData();

    const player = new Player("Tester", "warrior");
    const previousHealthBase = player.health.base;
    const expectedGain = player.endurance.base / 10;

    player.health.current = 1;
    player.levelUp();

    expect(player.level).toBe(2);
    expect(player.health.base).toBe(previousHealthBase + expectedGain);
    expect(player.health.base * 10).toBe(Math.round(player.health.base * 10));
    expect(player.health.current).toBe(player.health.base);
  });
});
