import Runtime from "@/core/runtime";

export default class Update {
  effects = new Map();
  constructor(runtime: Runtime) {}

  track(key: string, effect: any) {
    if (this.effects.has(key)) return;

    this.effects.set(key, effect);
  }

  trigger() {
    for (const effect of this.effects.values()) {
      effect();
    }
  }
}
