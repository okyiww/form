import { Metadata, ParsedSchemas } from "@/core/lifecycle/Schema/types";
import Runtime from "@/core/runtime";
import {
  traverse,
  isPromise,
  isValidComponent,
  wrapperNumericLike,
} from "@/core/services";
import { RawSchemas } from "@/helpers/defineFormSchema/types";
import { FormContext, isOnce, isRaw } from "@/index";
import {
  cloneDeep,
  get,
  isFunction,
  isPlainObject,
  isString,
  isUndefined,
  merge,
  set,
} from "lodash";
import { Ref, ref } from "vue";
import { usePathTracker } from "@/core/lifecycle/hooks/usePathTracker";
import { useSSRComponent } from "@/core/lifecycle/hooks/useSSRComponent";
import { deepTraverse } from "@/core/services/deepTraverse";
import { useDispatchHandler } from "@/core/lifecycle/hooks/useDispatchHandler";
import {
  isDynamicValue,
  processDynamicValue,
} from "@/core/lifecycle/hooks/useDispatchHandler/processDynamicValue";

export default class Schema {
  rawSchemas: RawSchemas | undefined = undefined;
  parsedSchemas: Ref<ParsedSchemas> = ref([]);
  refs = new Map<string, any>();

  constructor(public runtime: Runtime) {
    this.processSchemas();
  }

  processSSR(schemas: RawSchemas) {
    if (this.runtime.isSsr) {
      deepTraverse(schemas, (data, context) => {
        if (
          this.runtime.ssr.definitions?.dispatch &&
          data[this.runtime.ssr.definitions?.dispatch]
        ) {
          return useDispatchHandler(data, this.runtime);
        }
        if (context.key === "component") {
          return useSSRComponent(data, this.runtime); // 这里的 data 就是 componentName 了， 在 ssr 的情况下
        }
        if (isString(data) && isDynamicValue(data, this.runtime)) {
          return (utils: AnyObject) =>
            processDynamicValue(data, utils, this.runtime);
        }
        return data;
      });
    }
    return schemas;
  }

  processSchemas() {
    if (isFunction(this.runtime._options.schemas)) {
      const result = this.runtime._options.schemas() as any;
      if (isPromise(result)) {
        result.then((res: any) => {
          this.rawSchemas = cloneDeep(res);
          this.traverseSchemas(this.processSSR(cloneDeep(res)));
        });
      } else {
        this.traverseSchemas(this.processSSR(cloneDeep(result)));
      }
    } else if (isPromise(this.runtime._options.schemas)) {
      (this.runtime._options.schemas as unknown as Promise<RawSchemas>).then(
        (res: any) => {
          this.rawSchemas = cloneDeep(res);
          this.traverseSchemas(cloneDeep(res));
        }
      );
    } else {
      this.rawSchemas = cloneDeep(this.runtime._options.schemas);
      this.traverseSchemas(cloneDeep(this.runtime._options.schemas));
    }
  }

  // I hope this function can only be called once
  traverseSchemas(schemas: RawSchemas) {
    traverse(schemas, (_, key, parentKey) => {
      const path = parentKey
        ? `${wrapperNumericLike(parentKey)}.children.${wrapperNumericLike(key)}`
        : wrapperNumericLike(key);

      const schema = get(schemas, path);

      // 这里是为了方便后续的消费处理初始化 model 做准备
      if (isUndefined(schema.type)) {
        schema.type = "item";
      }

      this.parseSchema(schema, {
        path,
        setter: (processedValue, metadata, jumpConsume = false) => {
          !jumpConsume &&
            this.runtime._model.processRelation(metadata, processedValue);

          // 这里的预期是在确定有 field 的情况下去正确为没有提供 defaultValue 的 schema 提供 undefined 便于后续的消费
          if (
            metadata.propertyKey === "field" &&
            isUndefined(schema.defaultValue)
          ) {
            schema.defaultValue = undefined;
            // 立即触发一次消费，模拟不存在 defaultValue 在当前 schema 被处理成稳定的 undefined 之后的效果
            // ，从而推进处理流程，避免中断
            this.runtime._model.processRelation(
              {
                ...metadata,
                propertyKey: "defaultValue",
              },
              undefined
            );
          }

          set(
            this.parsedSchemas.value,
            `${metadata.path}.${metadata.propertyKey}`,
            processedValue
          );
        },
      });
      return true;
    });
  }

  /**
   * 需要注意的是，当我在实现这个的时候，我的 happy path 其实是过分关注于 input => renderable 的，这
   * 其实很大程度上存在风险，稍有不慎就会带来不可避免的重构难度，对此，除了谨慎考虑引入之外，我还建议在设计之初
   * 就引入足够复杂的场景，避免过于 happy path 导致复用性差并且代码复杂的问题
   */

  parseSchema(schema: any, metadata: Metadata) {
    Object.keys(schema).forEach((propertyKey) => {
      const propertyValue = schema[propertyKey];

      // 这里解构 metadata，避免下层数据在深度递归的场景下发生污染
      this.parseProperty(propertyKey, propertyValue, {
        ...metadata,
      });
    });
  }

  /**
   * 先说说这个函数做什么，防止后续误用，乱用
   * 这个函数并不是只用来处理 schema 的第一层遍历，而是一个通用型的函数，他的目的是用来处理任意键值对
   * 并且将处理的结果妥善的根据 metadata 设定到应该去的地方，那么可以想象到的是
   * 这个函数的出口是固定的，但是入口是不固定的，所以我会约束这个函数的出口返回的参数，但需要入口来适配这些参数才能正常使用它
   *
   * 那么这个函数的目的也就明了了，
   * 1、得到处理完成的值
   *    1、什么是处理完成？
   *    2、什么该处理，什么不该处理？
   *    3、怎么处理？
   * 2、调用 metadata 里的 setter，并且将处理完成的值和 metadata 传入
   */
  parseProperty(propertyKey: string, propertyValue: any, metadata: Metadata) {
    merge(metadata, {
      propertyKey,
      processedSetter(processedValue: any, jumpConsume = false) {
        metadata.setter(processedValue, metadata, jumpConsume);
      },
    });

    // 解开 metadata 避免数据污染
    this.processing(propertyValue, metadata);
  }

  usageTracker = new Map<string, Set<string>>();

  /**
   * 处理器
   * 1、返回值是什么
   * 2、什么该处理，什么不处理
   *
   * 处理器需要跟 Update 打通，留存记录
   *
   * 思路
   * 对于函数而言，将所有同步或异步的函数都处理成结果后，再进入 processNonFunction 函数进行处理，而对于其他数据，则直接进入
   * processNonFunction 函数进行处理
   */
  processing(value: any, metadata: Metadata) {
    if (isRaw(value)) {
      if (isFunction(value)) {
        const utils = {
          model: this.runtime._model.model.value,
          share: this.runtime.share.bind(this.runtime),
          shared: this.runtime.shared,
          refs: this.refs,
        };
        return metadata.processedSetter?.((...args: AnyArray) =>
          value(utils, ...args)
        );
      }
      return metadata.processedSetter?.(value);
    }

    if (isFunction(value)) {
      const effectKey = `${metadata.path}.${metadata.propertyKey}`;

      const utils = usePathTracker(
        {
          model: this.runtime._model.model.value,
          share: this.runtime.share.bind(this.runtime),
          shared: this.runtime.shared,
          refs: this.refs,
        },
        (path) => {
          /**
           * 这两块代码这么写看着臃肿，但其实是为了更好的代码可读性
           * 这表示目前只 track 两种数据的 effect，一种是使用了 model 的，另外一种是使用了 shared，这两种
           * 数据在变化的时候需要重新执行依赖
           */
          if (path.startsWith("model.")) {
            if (!isOnce(value)) {
              this.runtime._update.track(effectKey, {
                effectKey,
                trackedEffect: schemaEffect,
                trackingType: "model",
                trackingPath: path.replace(/^model\./, ""),
              });
            }
          }
          if (path.startsWith("shared.")) {
            if (!isOnce(value)) {
              this.runtime._update.track(effectKey, {
                effectKey,
                trackedEffect: schemaEffect,
                trackingType: "share",
                trackingPath: path.replace(/^shared\./, ""),
              });
            }
          }
        }
      );

      const schemaEffect = () => {
        const executionRes = value(utils);
        if (isPromise(executionRes)) {
          // 这里主要是为了不阻塞异步数据渲染，但是通过 jumpConsume 跳过消费，在最终 then 之后才看作是消费
          this.processingNonFunction(undefined, cloneDeep(metadata), true);
          executionRes.then((res: any) => {
            this.processingNonFunction(res, cloneDeep(metadata));
          });
          return;
        }
        return this.processingNonFunction(executionRes, cloneDeep(metadata));
      };

      return schemaEffect();
    }

    this.processingNonFunction(value, metadata);
  }

  // 处理非函数性数据
  // 通过 jumpConsume 跳过消费，用于在一些中间状态提供立即的数据支持
  processingNonFunction(value: any, metadata: Metadata, jumpConsume = false) {
    if (isValidComponent(metadata.propertyKey, value)) {
      return metadata.processedSetter?.(value);
    }

    // 到了这一步，可以认为这些 object，都是要深度进行处理的，因为 raw 和 component 已经在前面给搞定了

    if (isPlainObject(value)) {
      let propertyKey = metadata.propertyKey!;

      // 这个处理是为了防止在收集 field 和 defaultValue 的时候重复进行收集，因为 xxx.0 和 xxx.[0] 其实都是一个 schema，但是会被
      // 错误的收集两次
      // 更新 path，方便后续更新正确的 schema 位置
      metadata.path = `${metadata.path}.${wrapperNumericLike(propertyKey)}`;
      this.parseSchema(value, metadata);
      return;
    } else if (isFunction(value)) {
      this.processing(value, metadata);
      return;
    }

    // 非 object 数据，可以直接认为是处理完成
    metadata.processedSetter?.(value, jumpConsume);
  }
}
