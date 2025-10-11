import { TriggerType } from "@/core/lifecycle/Update/types";
import Runtime from "@/core/runtime";

export default class Update {
  effects = new Map();
  sharedEffects = new Map();
  constructor(runtime: Runtime) {}

  track(key: string, effect: any) {
    // 为可能存在的 share 也保存一份 track，从而隔离开来，避免无限触发
    if (this.effects.has(key)) return;
    this.effects.set(key, effect);
  }

  // 目前的更新逻辑是当 model 变化或者 share 执行时，触发 schema 的重新计算
  trigger(type: TriggerType = "model") {
    for (const effect of this.effects.values()) {
      effect(type);
    }
  }
}
