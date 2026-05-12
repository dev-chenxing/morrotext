import { describe, it, expect, vi, afterEach } from "vitest";
import inquirer from "inquirer";
import { talkToNPC } from "../systems/dialogue.ts";
import { getNPC } from "../world/npcs.ts";
import { areas } from "../world/areas.ts";
import { Player } from "../actors/Player.ts";
import { ITEMS } from "../world/items.ts";
import { SHOP_PRICES } from "../constants.ts";

describe("barter", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("Player travels to Havenwood and buys a Health Potion from the Publican", async () => {
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
    player.gold = 1000;

    const publican = getNPC("publican");

    await talkToNPC(publican, player);

    const price = Math.ceil(ITEMS.health_potion.value * SHOP_PRICES.BUY_MULTIPLIER);

    expect(player.getInventoryCount("health_potion")).toBeGreaterThanOrEqual(1);
    expect(player.gold).toBe(1000 - price);
    expect(promptMock).toHaveBeenCalled();
  });
});
