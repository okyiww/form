import { Metadata } from "@/core/lifecycle/Schema/types";
import Runtime from "@/core/runtime";
import { cloneDeep } from "lodash";

// 需要考虑的是创建类型？，创建什么样的类型

export default class Model {
  constructor(runtime: Runtime) {}

  /**
   * 我们知道 model 的关键是 field 和 defaultValue, 由于我们根本不知道这个过程什么时候
   * 会触发到谁，有可能都是异步，我们也不知道谁先执行，但是对于初始化 model 来说，我们知道，一定有
   * 一个同 path 的 field 对应一个同 path 的 defaultValue，如果处理完都还没有结束，那么剩下的
   * 就是没有提供 defaultValue 的 field，那么我们再给他设置为 undefined
   */

  // 关系表，用于收集 field 和 defaultValue 的对应关系, key 是 path
  relationMap = new Map<string, any>();

  // 默认是记录关系，如果检测到同 path 的 defaultValue 和 field 都已经稳定 processed，那么则可以消费记录
  // 消费记录只需要给是否消费的标记置为 true
  processRelation(metadata: Metadata, value: any) {
    if (
      !metadata.propertyKey ||
      !["defaultValue", "field", "type"].includes(metadata.propertyKey)
    ) {
      return;
    }
    if (metadata.propertyKey === "type" && value === "group") {
      return;
    }
    const mayBeRelation = this.relationMap.get(metadata.path);
    let allowConsume = false;
    let skipConsume = false;
    if (mayBeRelation && mayBeRelation.isConsumed === true) {
      skipConsume = true;
    }

    if (skipConsume) {
      return;
    } else if (!allowConsume) {
      this.relationMap.set(metadata.path, {
        metadata,
        ...this.relationMap.get(metadata.path),
        [metadata.propertyKey]: value,
        isConsumed: false,
      });
      const latestRelation = this.relationMap.get(metadata.path);
      if (
        "defaultValue" in latestRelation &&
        "field" in latestRelation &&
        "type" in latestRelation
      ) {
        this.consumeRelation(metadata.path);
      }
      return;
    }
  }

  consumeRelation(path: string) {
    console.log("当前 map 状况", cloneDeep(this.relationMap));
    // 消费关系
    const relation = this.relationMap.get(path);

    // 消费
    this.consume(relation);

    // 设置消费状态
    this.relationMap.set(path, {
      ...relation,
      isConsumed: true,
    });
  }

  /**
   * 让我们先来明确一些现状
   * 由于整个解析过程是无状态无依赖无顺序的，所以我们并不清楚谁先来后到，所以在这种场景下，数据一定要非常的干净有逻辑
   * 1、首先无 field 的类型不会被计入 ralationMap
   */
  consume(relation: Record<string, any>) {
    console.log("relation", relation);
  }
}
