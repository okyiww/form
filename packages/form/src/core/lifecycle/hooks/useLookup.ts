import { ParsedSchema } from "@/core/lifecycle/Schema/types";
import Runtime from "@/core/runtime";
import {
  isBoolean,
  isEmpty,
  isFunction,
  isObject,
  isString,
  isArray,
  get,
  set,
  find,
  compact,
  map,
} from "lodash";

/**
 * 该函数就像是一个 pipe，在这个时候只记录处理定义和必要元信息，真正触发的时候再根据 path 去动态处理结果
 * lookup 功能主要是用来给一些筛选组件用来快速匹配 label 的，比如 Select 或者 Cascader
 * 支持多种配置形式（通过规范化处理，避免后续逻辑分支）：
 * - true: 简单的值展示
 * - function: 动态获取配置，适用于 RangePicker 等特定组件
 * - object: 静态配置，包含 source、match、format 等
 */

export function useLookup(
  schema: ParsedSchema,
  fieldTarget: string,
  runtime: Runtime
) {
  const lookup = runtime.lookups.value.get(fieldTarget);
  // 如果已经注册过该字段的 lookup，直接返回避免重复注册导致无限循环
  if (lookup) {
    return;
  }

  // 规范化 lookup 配置：如果是函数，标记为需要动态执行
  // 注意：这里不执行函数，而是在 useLookupProcess 时执行，因为可能依赖运行时状态
  const isLookupFunction = isFunction(schema.lookup);
  const lookupConfig = isLookupFunction ? null : schema.lookup;

  // 记录 sourceKey 用于后续动态获取最新的 source
  const sourceKey =
    !isLookupFunction && isString(lookupConfig?.source)
      ? lookupConfig.source
      : null;

  runtime.lookups.value.set(fieldTarget, {
    sourceKey,
    match: lookupConfig?.match,
    fieldTarget,
    schema,
  });
}

export function useLookupProcess(path: string, value: any, runtime: Runtime) {
  for (const lookup of runtime.lookups.value.values()) {
    if (!(lookup.fieldTarget === path)) continue;

    const rawLookup = lookup.schema.lookup;

    // 第一步：规范化配置
    // 函数有两种用法：
    // 1. 工厂函数返回配置：() => ({ format, valid, render })
    // 2. 函数对象（有 format/render 属性）：带属性的函数
    let lookupConfig: any;
    if (isFunction(rawLookup)) {
      const fnAsObj = rawLookup as any;

      // 优先检查函数对象的属性
      if (fnAsObj.format || fnAsObj.render || fnAsObj.valid) {
        // 函数对象模式：使用函数的属性
        lookupConfig = {
          format: fnAsObj.format,
          render: fnAsObj.render,
          valid: fnAsObj.valid,
        };
      } else {
        // 工厂函数模式：调用函数获取配置对象
        const callResult = rawLookup();
        lookupConfig =
          isObject(callResult) && !isArray(callResult) ? callResult : true; // 如果不返回对象，退化为简单模式
      }
    } else {
      lookupConfig = rawLookup;
    }

    // 第二步：确定是否需要 source 匹配
    const needsSourceMatch = lookupConfig !== true && lookup.match;

    // 第三步：获取 matchResult 和 matchKey
    let matchResult: any;
    let matchKey: string | MatchFn | undefined = undefined;

    if (needsSourceMatch) {
      // 需要从 source 中匹配数据
      let source = lookupConfig?.source;
      if (lookup.sourceKey) {
        source = get(lookup.schema.componentProps, lookup.sourceKey);
      }
      // 如果 source 还没准备好（异步数据还没返回），跳过本次计算
      if (source === undefined) {
        return;
      }

      matchKey = lookup.match as string | MatchFn;
      matchResult = findByKey(source, matchKey, value);

      // source 匹配失败，删除结果
      if (!matchResult || isEmpty(matchResult)) {
        return runtime.lookupResults.value.delete(lookup.fieldTarget);
      }
    } else {
      // 简单模式：直接使用 value，不需要从 source 匹配
      if (!value) {
        return runtime.lookupResults.value.delete(lookup.fieldTarget);
      }
      matchResult = value;
    }

    // 第四步：统一处理 format
    const formattedResult = lookupConfig?.format
      ? lookupConfig.format(matchResult)
      : matchResult;

    // 第五步：统一处理 valid（如果有）
    if (lookupConfig?.valid) {
      const isValid = lookupConfig.valid(formattedResult);
      if (!isValid) {
        return runtime.lookupResults.value.delete(lookup.fieldTarget);
      }
    }

    // 第六步：设置最终结果
    runtime.lookupResults.value.set(lookup.fieldTarget, {
      label: lookup.schema.label,
      matchResult: formattedResult,
      delete: createDeleteHandler(runtime, lookup.fieldTarget, matchKey),
      render: lookupConfig?.render,
    });
  }
}

type MatchFn<T = unknown> = (item: T, value: unknown) => boolean;

interface FindOptions<T = unknown> {
  childrenKey?: string;
  format?: (result: T | T[] | T[][]) => unknown;
}

/**
 * 在任意数据结构中查找匹配的数据
 */
function findByKey<T = unknown>(
  data: unknown,
  matcher: string | MatchFn<T>,
  value: unknown,
  options?: FindOptions<T>
): unknown {
  const { childrenKey, format } = options || {};

  const isMatch = (item: unknown, val: unknown): boolean => {
    if (!isObject(item) || isArray(item)) return false;
    return typeof matcher === "function"
      ? matcher(item as T, val)
      : get(item, matcher) === val;
  };

  // 深度查找（遍历所有属性）
  const findDeep = (source: unknown, val: unknown): T | undefined => {
    if (!isObject(source)) return undefined;

    if (isArray(source)) {
      for (const item of source) {
        if (isMatch(item, val)) return item as T;
        const found = findDeep(item, val);
        if (found) return found;
      }
      return undefined;
    }

    if (isMatch(source, val)) return source as T;

    for (const prop of Object.values(source)) {
      const found = findDeep(prop, val);
      if (found) return found;
    }
    return undefined;
  };

  // 树路径查找（逐层进入 children）
  const findPath = (path: unknown[]): T[] => {
    let level: unknown = data;
    return compact(
      map(path, (val) => {
        const found = find(level as unknown[], (item) => isMatch(item, val)) as
          | T
          | undefined;
        level = found ? get(found, childrenKey!) : undefined;
        return found;
      })
    );
  };

  // 主逻辑
  let result: unknown;
  const isNested = isArray(value) && isArray((value as unknown[])[0]);

  if (childrenKey) {
    result = isNested
      ? map(value as unknown[][], findPath)
      : isArray(value)
      ? findPath(value as unknown[])
      : findDeep(data, value);
  } else {
    result = isNested
      ? map(value as unknown[][], (arr) =>
          compact(map(arr, (v) => findDeep(data, v)))
        )
      : isArray(value)
      ? compact(map(value as unknown[], (v) => findDeep(data, v)))
      : findDeep(data, value);
  }

  return format && result !== undefined
    ? format(result as T | T[] | T[][])
    : result;
}

/**
 * 创建 delete 处理函数
 * @param runtime Runtime 实例
 * @param fieldTarget 字段路径
 * @param match 匹配配置（可选，用于对象数组的匹配）
 */
function createDeleteHandler(
  runtime: Runtime,
  fieldTarget: string,
  match?: string | MatchFn
) {
  return (valueToRemove?: unknown) => {
    // 如果没传 valueToRemove，完全删除该字段
    if (valueToRemove === undefined) {
      runtime.deleteField(fieldTarget);
      return;
    }

    const currentValue = get(runtime._model.model.value, fieldTarget);

    // 如果当前值不是数组，完全删除
    if (!isArray(currentValue)) {
      runtime.deleteField(fieldTarget);
      return;
    }

    // 从数组中移除匹配项
    const newValue = currentValue.filter((item: unknown) => {
      // 1. valueToRemove 是函数时，作为 predicate 使用
      if (isFunction(valueToRemove)) {
        return !(valueToRemove as (item: unknown) => boolean)(item);
      }

      // 2. 对象数组且有 match 配置时，使用 match 逻辑
      if (isObject(item) && !isArray(item) && match) {
        if (isFunction(match)) {
          return !match(item, valueToRemove);
        }
        // match 是字符串路径，如 'id' 或 'user.id'
        return get(item, match) !== valueToRemove;
      }

      // 3. 简单值比较（适用于简单数组如 ['A', 'B']）
      return item !== valueToRemove;
    });

    // 设置过滤后的新数组
    set(runtime._model.model.value, fieldTarget, newValue);
  };
}
