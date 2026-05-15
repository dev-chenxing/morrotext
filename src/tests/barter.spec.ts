import { describe, it, expect, vi, afterEach } from "vitest";
import inquirer from "inquirer";
import { initializeGameData } from "../initialize.ts";
import { barter } from "../systems/barter.ts";
import { talkToNPC } from "../systems/dialogue.ts";
import { createNPCInstance } from "../world/npcs.ts";
import { areas } from "../world/areas.ts";
import { Player } from "../actors/Player.ts";
import type { Alchemy } from "../types.ts";
import { ITEMS } from "../world/items.ts";
import { SHOP_PRICES } from "../constants.ts";

describe("barter", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("Player travels to Havenwood and buys a Health Potion from the Publican", async () => {
    initializeGameData();

    // Verify Havenwood exists (travel target)
    expect(areas.town.name).toBe("Havenwood");

    // Mock the prompt sequence for: talkToNPC -> open_shop -> buyItems -> exit shop -> leave
    // 1) talkToNPC initial choice -> open_shop
    // 2) barter prompt -> choose "Buy Items"
    // 3) buyItems prompt -> select "health_potion"
    // 4) barter prompt -> choose "Exit"
    // 5) talkToNPC prompt -> choose "leave"
    const promptMock = vi
      .spyOn(inquirer, "prompt")
      .mockResolvedValueOnce({ choice: { action: "open_shop", data: {} } } as any)
      .mockResolvedValueOnce({ action: "Buy Items" } as any)
      .mockResolvedValueOnce({ itemId: "health_potion" } as any)
      .mockResolvedValueOnce({ action: "Exit" } as any)
      .mockResolvedValueOnce({ choice: { action: "leave", data: {} } } as any);

    const player = new Player("Tester", "warrior");
    player.inventory["gold"] = 1000;

    const publican = createNPCInstance("publican");

    await talkToNPC(publican, player);

    const price = Math.ceil((ITEMS.health_potion as Alchemy).value * SHOP_PRICES.BUY_MULTIPLIER);

    expect(player.inventory["health_potion"] || 0).toBeGreaterThanOrEqual(1);
    expect(player.inventory["gold"] || 0).toBe(1000 - price);
    expect(promptMock).toHaveBeenCalled();
  });

  it("Merchant buy list is limited to their inventory", async () => {
    initializeGameData();

    const player = new Player("Tester", "warrior");
    const smith = createNPCInstance("smith");

    const promptMock = vi
      .spyOn(inquirer, "prompt")
      .mockResolvedValueOnce({ action: "Buy Items" } as any)
      .mockResolvedValueOnce({ itemId: null } as any)
      .mockResolvedValueOnce({ action: "Exit" } as any);

    await barter(player, smith);

    const buyPrompt = promptMock.mock.calls[1]?.[0] as
      | { choices?: Array<{ name: string; value: string | null }> }
      | undefined;

    expect(buyPrompt?.choices?.some((choice) => choice.value === "steel_sword")).toBe(true);
    expect(buyPrompt?.choices?.some((choice) => choice.value === "iron_sword")).toBe(false);
    expect(buyPrompt?.choices?.some((choice) => choice.value === "health_potion")).toBe(false);
  });
});
