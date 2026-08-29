export class DeterministicDice {
  private state: number;

  constructor(seed: number) {
    this.state = (seed === 0 ? 1 : seed) >>> 0;
  }

  public getState(): number {
    return this.state >>> 0;
  }

  public setState(state: number): void {
    this.state = (state === 0 ? 1 : state) >>> 0;
  }

  public next(): number {
    let t = (this.state += 0x6d2b79f5) >>> 0;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  public nextInt(minInclusive: number, maxInclusive: number): number {
    const span = maxInclusive - minInclusive + 1;
    return minInclusive + Math.floor(this.next() * span);
  }

  public rollD20(): number {
    return this.nextInt(1, 20);
  }

  public pick<T>(items: readonly T[]): T {
    if (items.length === 0) {
      throw new Error("Cannot pick from an empty array");
    }
    return items[this.nextInt(0, items.length - 1)];
  }

  public shuffle<T>(items: readonly T[]): T[] {
    const out = items.slice();
    for (let i = out.length - 1; i > 0; i--) {
      const j = this.nextInt(0, i);
      const tmp = out[i];
      out[i] = out[j];
      out[j] = tmp;
    }
    return out;
  }
}
