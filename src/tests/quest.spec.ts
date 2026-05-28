import { describe, it, expect, afterEach } from "vitest";
import { initializeGameData } from "../core/initialize.ts";
import { game } from "../core/gameState.ts";
import { startQuest, updateJournal } from "../core/systems/quest.ts";

describe("Quest journal monotonicity", () => {
  afterEach(() => {
    game.player = null;
    game.worldController.quests.forEach((q) => {
      q.isActive = false;
      q.isStarted = false;
      q.isFinished = false;
      if (q.dialogue) q.dialogue.forEach((d) => (d.journalIndex = 0));
    });
  });

  it("initializes quest journal index at start and enforces monotonicity", () => {
    initializeGameData();

    const quest = startQuest("Report to Caius Cosades");
    expect(quest).not.toBeNull();
    if (!quest) return;

    // initial index
    expect(quest.dialogue[0].journalIndex).toBe(0);

    // advance to 1
    expect(updateJournal("report_to_caius_cosades", 1, false)).toBe(true);
    expect(quest.dialogue[0].journalIndex).toBe(1);

    // skip forward to 3 (allowed)
    expect(updateJournal("report_to_caius_cosades", 3, false)).toBe(true);
    expect(quest.dialogue[0].journalIndex).toBe(3);

    // attempt to go backwards (disallowed)
    expect(updateJournal("report_to_caius_cosades", 2, false)).toBe(false);
    expect(quest.dialogue[0].journalIndex).toBe(3);
  });
});
