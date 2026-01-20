import { useLookupProcess } from "@/core/lifecycle/hooks/useLookup";
import { Metadata } from "@/core/lifecycle/Schema/types";
import Runtime from "@/core/runtime";
import { checkRelations } from "@/core/services";
import { cloneDeep, get, reverse, set } from "lodash";
import onChange from "on-change";
import { ref } from "vue";

// 需要考虑的是创建类型？，创建什么样的类型

export default class Model {
  constructor(public runtime: Runtime) {}

  /**
   * 我们知道 model 的关键是 field 和 defaultValue, 由于我们根本不知道这个过程什么时候
   * 会触发到谁，有可能都是异步，我们也不知道谁先执行，但是对于初始化 model 来说，我们知道，一定有
   * 一个同 path 的 field 对应一个同 path 的 defaultValue，如果处理完都还没有结束，那么剩下的
   * 就是没有提供 defaultValue 的 field，那么我们再给他设置为 undefined
   */

  // 关系表，用于收集 field 和 defaultValue 的对应关系, key 是 path
  relationMap = new Map<string, any>();

  model = ref<Record<string, any>>(
    onChange({}, (path, value) => {
      this.runtime._update.trigger("model", path);
      if (!this.runtime._options.noAutoLookup) {
        useLookupProcess(path, value, this.runtime);
      }
    })
  );

  triggerLookup() {
    // 遍历所有已注册的 lookups，从 model 中获取对应路径的值来触发计算
    // 这样可以正确处理嵌套路径如 memberProfileExtension.phoneRegion
    for (const [fieldTarget] of this.runtime.lookups.value.entries()) {
      const value = get(this.model.value, fieldTarget);
      if (value !== undefined) {
        useLookupProcess(fieldTarget, value, this.runtime);
      }
    }
  }

  immutableModel = {};

  allConsumed = ref(false);

  // 默认是记录关系，如果检测到同 path 的 defaultValue 和 field 都已经稳定 processed，那么则可以消费记录
  // 消费记录只需要给是否消费的标记置为 true
  processRelation(metadata: Metadata, value: any) {
    if (
      !metadata.propertyKey ||
      !["defaultValue", "field", "type"].includes(metadata.propertyKey) ||
      // 这里是为了防止像 componentProps 中或者什么 slots 中也出现 type 被当作类别来处理
      !metadata.path.endsWith("]")
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
    // 消费关系
    const relation = this.relationMap.get(path);
    if (relation.processedPath) {
      return;
    }

    // 消费
    this.consume(relation);

    // 设置基于 path 的处理状态
    this.relationMap.set(path, {
      ...relation,
      processedPath: true,
    });
  }

  /**
   * 让我们先来明确一些现状
   * 由于整个解析过程是无状态无依赖无顺序的，所以我们并不清楚谁先来后到，所以在这种场景下，数据一定要非常的干净有逻辑
   * 1、无 field 的类型不会被计入 ralationMap
   * 2、如果一个消费关系的 path 包含了 children，那么它可能是在 group 里，也可能是在 list 里
   * 3、如果一个消费关系的 path 包含了 children，并且 relationMap 中存在 path 是当前 path 的前缀，那么它一定是在 list 里
   * 4、同理，如果找不到这样的前缀，那么它一定是在 group 里
   */
  consume(relation: Record<string, any>) {
    const path = relation.metadata.path;
    const checkResult = checkRelations(this.relationMap, path);

    if (path.includes("children")) {
      /**
       * 需要区分是 group 还是 list，group 则使用普通的消费逻辑，list 则需要更复杂的逻辑
       * 对于 list 来说，如果当前 model
       */

      if (!checkResult.isListChild) {
        // 对于 group 类型下的数据，直接消费

        set(this.model.value, relation.field, relation.defaultValue);
      } else {
        // 初始化或者依次获取当前 model 里的状态
        // 这里也有两种情况
        // 1、这时候 list field 已经存在，那么只需要往存在的数据中去更新
        // 2、这时候 list 的 field 还未知，我们也不知道要更新到什么地方，所以这个更新是一个悬垂的状态
        this.resolveRelations(reverse(checkResult.existingRelations));
      }
    } else {
      // 普通消费逻辑
      set(this.model.value, relation.field, relation.defaultValue);
    }

    /**
     * 每次都检测一下，当所有的消费均已完成时，则可以留存一份永远不会被改变的 model，这个 model 是初始化 model 的最终结果，便于
     * 后续实现重置逻辑或者是 list 的添加逻辑等
     */
    this.checkingConsume();
  }

  defaultValueCalcByType(type: string) {
    if (type === "list") {
      return [];
    }
    return undefined;
  }

  resolveRelations(relations: Record<string, any>[], basePath?: string) {
    if (relations.length === 0) return;
    const { current, parent } = relations[0];
    if (!current.field) return;
    // 如果有 field 但是没有 defaultValue 说明 defaultValue 是异步处理，但 field 已经有了，所以可以不阻塞继续往下走
    if (!("defaultValue" in current)) {
      relations.shift();
      this.resolveRelations(
        [...relations],
        basePath
          ? `${basePath}.[0].${current.field}`
          : !parent
          ? current.field
          : `[0].${current.field}`
      );
      return;
    }

    if (!current.isConsumed) {
      set(
        this.model.value,
        `${basePath ? `${basePath}.[0].${current.field}` : `${current.field}`}`,
        current.defaultValue ?? this.defaultValueCalcByType(current.type)
      );
      current.isConsumed = true;
    }

    relations.shift();
    this.resolveRelations(
      [...relations],
      basePath
        ? `${basePath}.[0].${current.field}`
        : !parent
        ? current.field
        : `[0].${current.field}`
    );
  }

  isAllConsumed() {
    return (this.allConsumed.value = Array.from(
      this.relationMap.values()
    ).every((relation) => {
      // 这里还需要顾及一种情况，也就是用户提供了不存在 field 也不存在 defaultValue 的 relation，比如仅做展示用的组件，日期展示等等这种情况
      // 也应当被认为是一种处理完毕的状态
      if (!("defaultValue" in relation) && !("field" in relation)) {
        return true;
      }
      return relation.isConsumed;
    }));
  }

  checkingConsume() {
    // 检测 relationMap 里每一项都有 "defaultValue" "type" "field"

    for (const relation of this.relationMap.values()) {
      if (
        "defaultValue" in relation &&
        "type" in relation &&
        "field" in relation
      ) {
        relation.isConsumed = true;
      }
    }

    if (this.isAllConsumed()) {
      this.immutableModel = cloneDeep(this.model.value);
    }
  }
}
