import { getObject } from "../gameState.ts";
import type { Inventory, Item, ItemStack } from "../types.ts";
import { createLeveledItem } from "../world/leveledItems.ts";

class DefaultInventory implements Inventory {
  items: ItemStack[] = [];
  // tracks how many units of a restockable item have been consumed since last restock
  private consumed: Record<string, number> = {};

  addItem(item: Item | string, count = 1) {
    const resolved: Item | null = typeof item === "string" ? (getObject(item) ?? null) : item;
    if (!resolved) return 0;

    const existing = this.items.find((s) => s.object.id === resolved.id);
    if (existing) {
      if (existing.count < 0) {
        // Keep restockable configuration: increase the restock amount
        const newAmount = Math.abs(existing.count) + count;
        existing.count = -newAmount;
      } else {
        existing.count += count;
      }
    } else {
      this.items.push({ object: resolved, count });
    }
    return count;
  }

  removeItem(item: Item | string, count = 1) {
    const id = typeof item === "string" ? item : item.id;
    const idx = this.items.findIndex((s) => s.object.id === id);
    if (idx === -1) return 0;
    const stack = this.items[idx];

    // restockable stacks are represented by a negative `count` whose absolute value
    // is the restock amount. We track consumption separately in `consumed`.
    if (stack.count < 0) {
      const restockAmount = Math.abs(stack.count);
      const consumed = this.consumed[id] ?? 0;
      const available = Math.max(0, restockAmount - consumed);
      const removed = Math.min(count, available);
      if (removed <= 0) return 0;
      this.consumed[id] = consumed + removed;
      return removed;
    }

    const removed = Math.min(count, stack.count);
    if (removed <= 0) return 0;
    stack.count -= removed;
    if (stack.count <= 0) this.items.splice(idx, 1);
    return removed;
  }

  contains(item: Item | string) {
    const id = typeof item === "string" ? item : item.id;
    return this.availableCount(id) > 0;
  }

  restock() {
    // clear consumed counts for restockable entries so they're fully available again
    this.items.forEach((s) => {
      if (s.count < 0) this.consumed[s.object.id] = 0;
    });
  }

  getItemCount(item: Item | string) {
    const id = typeof item === "string" ? item : item.id;
    return this.availableCount(id);
  }

  resolveLeveledItems(items: Record<string, number>) {
    Object.entries(items).forEach(([itemId, count]) => {
      if (count === 0) return;
      const resolved = getObject(itemId);
      if (resolved) {
        // keep negative counts as restockable configuration
        this.items.push({ object: resolved, count });
        return;
      }

      if (count < 0) return;

      for (let i = 0; i < count; i++) {
        const leveled = createLeveledItem(itemId);
        if (!leveled) continue;
        const picked = leveled.pickFrom();
        if (!picked) continue;
        this.addItem(picked);
      }
    });
  }

  private availableCount(item: Item | string) {
    const id = typeof item === "string" ? item : item.id;
    const stack = this.items.find((s) => s.object.id === id);
    if (!stack) return 0;
    if (stack.count < 0) {
      const restockAmount = Math.abs(stack.count);
      const consumed = this.consumed[id] ?? 0;
      return Math.max(0, restockAmount - consumed);
    }
    return Math.max(0, stack.count);
  }
}

export function createInventory(): Inventory {
  return new DefaultInventory();
}

export function cloneInventory(inventory: Inventory): Inventory {
  const cloned = createInventory();

  inventory.items.forEach((stack) => {
    cloned.addItem(stack.object, stack.count);
  });

  return cloned;
}

export function createInventoryFromRecord(items: Record<string, number>): Inventory {
  // Create an empty runtime inventory object
  const inventory = createInventory();

  // Loop through each entry in the record
  Object.entries(items).forEach(([itemId, count]) => {
    // Ignore zero counts
    if (count === 0) return;

    // Try to resolve the ID as an object.
    // If it exists, it gets added directly.
    const resolved = getObject(itemId);
    if (resolved) {
      // keep negative counts as a restockable configuration (e.g. -1 means restockable 1)
      inventory.items.push({ object: resolved, count });
      return;
    }

    if (count < 0) return;

    for (let index = 0; index < count; index++) {
      const leveled = createLeveledItem(itemId);
      if (!leveled) continue;

      const picked = leveled.pickFrom();
      if (!picked) continue;

      inventory.addItem(picked);
    }
  });

  return inventory;
}
