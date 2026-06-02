import type { Reference } from "../../types.ts";

export class MobManager {
  movingProps: Reference[];

  constructor() {
    this.movingProps = [];
  }

  addMovingProp(reference: Reference): void {
    if (!this.movingProps.includes(reference)) {
      this.movingProps.push(reference);
    }
  }

  removeMovingProp(reference: Reference): boolean {
    const index = this.movingProps.indexOf(reference);
    if (index === -1) {
      return false;
    }

    this.movingProps.splice(index, 1);
    return true;
  }

  clearMovingProps(): void {
    this.movingProps.length = 0;
  }
}
