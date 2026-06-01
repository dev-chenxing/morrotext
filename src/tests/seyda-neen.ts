import { describe, it, expect, vi, afterEach } from "vitest";
import { createPlayer } from "../core/actors/Player.ts";
import type { MobilePlayer } from "../types.ts";
import { talkToNPC } from "../core/systems/dialogue.ts";
import { initializeGameData } from "../core/initialize.ts";
import { createNPCInstance } from "../core/systems/npc.ts";
import { hasStartedQuest } from "../core/systems/quest.ts";
import * as prompt from "../core/ui/prompt.ts";

describe("Seyda Neen opening and quest flow", () => {
  afterEach(() => {
    vi.restoreAllMocks();
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

    const player = createPlayer();
    const mobilePlayer = player.mobile as MobilePlayer;
    mt.player = player;
    mt.mobilePlayer = mobilePlayer;

    const sellus = createNPCInstance("chargen captain");
    const topic = mt.dataHandler.nonDynamicData.dialogues.find((d) => d.id === "duties");
    vi.spyOn(prompt, "select")
      .mockResolvedValueOnce({ topicId: topic?.id ?? null } as any)
      .mockResolvedValueOnce({ topicId: null } as any);

    await talkToNPC(sellus, mobilePlayer);

    expect(hasStartedQuest("A1_1_FindSpymaster")).toBe(true);
    expect(mobilePlayer.inventory.getItemCount("Gold_001")).toBe(87);
    expect(mobilePlayer.inventory.getItemCount("bk_A1_1_DirectionsCaiusCosades")).toBe(1);
    expect(mobilePlayer.inventory.getItemCount("bk_a1_1_caiuspackage")).toBe(1);
  });
});
