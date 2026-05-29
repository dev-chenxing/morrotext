import { describe, it, expect, vi, afterEach } from "vitest";
import inquirer from "inquirer";
import { createPlayer } from "../core/actors/Player.ts";
import type { MobilePlayer } from "../types.ts";
import { talkToNPC } from "../core/systems/dialogue.ts";
import { initializeGameData } from "../core/initialize.ts";
import { createNPCInstance } from "../core/systems/npc.ts";
import { hasStartedQuest } from "../core/systems/quest.ts";

describe("Prisoner Released opening", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    mt.player = null;
    mt.mobilePlayer = null;
    mt.worldController.allMobileActors.length = 0;
    mt.worldController.quests.forEach((quest) => {
      quest.isActive = false;
      quest.isStarted = false;
      quest.isFinished = false;
    });
  });

  it("uses the Seyda Neen opening cells", async () => {
    initializeGameData();
    const cells = mt.dataHandler.nonDynamicData.cells.reduce(
      (acc, cell) => {
        acc[cell.id] = cell;
        return acc;
      },
      {} as Record<string, (typeof mt.dataHandler.nonDynamicData.cells)[0]>,
    );

    expect(cells["Imperial Prison Ship"].id).toBe("Imperial Prison Ship");
    expect(cells["Seyda Neen"].id).toBe("Seyda Neen");
    expect(cells["Seyda Neen, Census and Excise Office"].displayName).toBe(
      "Seyda Neen, Census and Excise Office",
    );
  });

  it("Sellus Gravius starts Report to Caius Cosades and grants the release items", async () => {
    initializeGameData();

    const player = createPlayer("Tester", "warrior");
    const mobilePlayer = player.mobile as MobilePlayer;
    mt.player = player;
    mt.mobilePlayer = mobilePlayer;

    const sellus = createNPCInstance("chargen captain");
    const topic = mt.dataHandler.nonDynamicData.dialogues.find(
      (d) => d.id === "I'm ready for my release papers.",
    );
    vi.spyOn(inquirer, "prompt").mockResolvedValue({
      topicId: topic?.id ?? null,
    } as any);

    await talkToNPC(sellus, mobilePlayer);

    expect(hasStartedQuest("Report to Caius Cosades")).toBe(true);
    expect(mobilePlayer.inventory.getItemCount("gold")).toBe(87);
    expect(mobilePlayer.inventory.getItemCount("common_shirt")).toBe(1);
    expect(mobilePlayer.inventory.getItemCount("common_pants")).toBe(1);
    expect(mobilePlayer.inventory.getItemCount("common_shoes")).toBe(1);
    expect(
      mobilePlayer.inventory.getItemCount("directions_to_caius_cosades"),
    ).toBe(1);
    expect(
      mobilePlayer.inventory.getItemCount("package_for_caius_cosades"),
    ).toBe(1);
  });
});
