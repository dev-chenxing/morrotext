import { describe, it, expect, afterEach } from "vitest";
import { initializeGameData } from "../core/initialize.ts";

describe("Quest journal monotonicity", () => {
  afterEach(() => {
    mt.player = null;
    mt.mobilePlayer = null;
    mt.worldController.allMobileActors.length = 0;
    mt.worldController.quests.forEach((q) => {
      q.isActive = false;
      q.isStarted = false;
      q.isFinished = false;
      if (q.dialogue) q.dialogue.forEach((d) => (d.journalIndex = 0));
    });
  });

  it("initializes quest journal index at start and enforces monotonicity", () => {
    initializeGameData();

    const wasStarted = mt.updateJournal("A1_1_FindSpymaster", 0);
    expect(wasStarted).toBe(true);

    const quest = mt.worldController.quests.find((entry) => entry.id === "A1_1_FindSpymaster");
    expect(quest).toBeDefined();
    if (!quest) return;

    expect(quest.isActive).toBe(true);
    expect(quest.isStarted).toBe(true);
    expect(quest.isFinished).toBe(false);

    // initial index
    expect(quest.dialogue[0].journalIndex).toBe(0);

    // advance to 1
    expect(mt.updateJournal("A1_1_FindSpymaster", 1, false)).toBe(true);
    expect(quest.dialogue[0].journalIndex).toBe(1);

    // skip forward to 3 (allowed)
    expect(mt.updateJournal("A1_1_FindSpymaster", 3, false)).toBe(true);
    expect(quest.dialogue[0].journalIndex).toBe(3);

    // attempt to go backwards (disallowed)
    expect(mt.updateJournal("A1_1_FindSpymaster", 2, false)).toBe(false);
    expect(quest.dialogue[0].journalIndex).toBe(3);
  });
});
