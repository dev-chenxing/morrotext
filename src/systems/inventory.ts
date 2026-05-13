import { getObject } from "../gameState.ts";
import type { Inventory, Item, ItemStack } from "../types.ts";

class DefaultInventory implements Inventory {
  items: ItemStack[] = [];

  addItem(item: Item | string, count = 1) {
    const resolved: Item | null = typeof item === "string" ? getObject(item) : item;
    if (!resolved) return 0;

    const existing = this.items.find((s) => s.object.id === resolved.id);
    if (existing) {
      existing.count += count;
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
    const removed = Math.min(count, stack.count);
    if (removed <= 0) return 0;
    stack.count -= removed;
    if (stack.count <= 0) this.items.splice(idx, 1);
    return removed;
  }

  contains(item: Item | string) {
    const id = typeof item === "string" ? item : item.id;
    return this.items.some((s) => s.object.id === id && s.count > 0);
  }
}

export function createInventory(): Inventory {
  return new DefaultInventory();
}
