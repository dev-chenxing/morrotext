import { describe, it, expect, vi, afterEach } from "vitest";
import inquirer from "inquirer";
import { Player } from "../core/actors/Player.ts";
import { talkToNPC } from "../core/systems/dialogue.ts";
import { initializeGameData } from "../core/initialize.ts";
import { cells } from "../data/cells/index.ts";
import { getDialogues } from "../core/gameState.ts";
import { createNPCInstance } from "../core/systems/npc.ts";
import { game } from "../core/gameState.ts";
import { hasStartedQuest } from "../core/systems/quest.ts";

describe("Prisoner Released opening", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    game.player = null;
    game.worldController.quests.forEach((quest) => {
      quest.isActive = false;
      quest.isStarted = false;
      quest.isFinished = false;
    });
  });

  it("uses the Seyda Neen opening cells", async () => {
    initializeGameData();

    expect(cells["Imperial Prison Ship"].id).toBe("Imperial Prison Ship");
    expect(cells["Seyda Neen"].id).toBe("Seyda Neen");
    expect(cells["Seyda Neen, Census and Excise Office"].displayName).toBe(
      "Seyda Neen, Census and Excise Office",
    );
  });

  it("Sellus Gravius starts Report to Caius Cosades and grants the release items", async () => {
    initializeGameData();

    const player = new Player("Tester", "warrior");
    game.player = player;

    const sellus = createNPCInstance("chargen captain");
    const topic = getDialogues().find(
      (d) => d.id === "I'm ready for my release papers.",
    );
    vi.spyOn(inquirer, "prompt").mockResolvedValue({
      topicId: topic?.id ?? null,
    } as any);

    await talkToNPC(sellus, player);

    expect(hasStartedQuest("Report to Caius Cosades")).toBe(true);
    expect(player.inventory.getItemCount("gold")).toBe(87);
    expect(player.inventory.getItemCount("common_shirt")).toBe(1);
    expect(player.inventory.getItemCount("common_pants")).toBe(1);
    expect(player.inventory.getItemCount("common_shoes")).toBe(1);
    expect(player.inventory.getItemCount("directions_to_caius_cosades")).toBe(
      1,
    );
    expect(player.inventory.getItemCount("package_for_caius_cosades")).toBe(1);
  });
});
