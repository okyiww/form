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
  
  // 记录 sourceKey 用于后续动态获取最新的 source
  const sourceKey = isString(schema.lookup.source) ? schema.lookup.source : null;
  
  runtime.lookups.value.set(fieldTarget, {
    // source 不在这里固定，而是在 useLookupProcess 时动态获取
    sourceKey,
    match: schema.lookup.match,
    fieldTarget,
    schema,
  });
}

export function useLookupProcess(path: string, value: any, runtime: Runtime) {
  for (const lookup of runtime.lookups.value.values()) {
    if (!(lookup.fieldTarget === path)) continue;

    if (lookup.schema.lookup === true || isFunction(lookup.schema.lookup)) {
      if (!value) {
        return runtime.lookupResults.value.delete(lookup.fieldTarget);
      }
      runtime.lookupResults.value.set(lookup.fieldTarget, {
        label: lookup.schema.label,
        matchResult: lookup.schema.lookup?.format
          ? lookup.schema.lookup?.format(value)
          : value,
        // lookup === true 的情况没有 match 配置，只支持简单值比较或 predicate 函数
        delete: createDeleteHandler(runtime, lookup.fieldTarget),
      });
      return;
    }
    // 动态获取最新的 source，而不是使用注册时的固定值
    // 这样可以正确处理异步 options 的场景
    let source = lookup.schema.lookup?.source;
    if (lookup.sourceKey) {
      source = get(lookup.schema.componentProps, lookup.sourceKey);
    }
    // 如果 source 还没准备好（异步数据还没返回），跳过本次计算
    if (source === undefined) {
      return;
    }
    const matchResult = findByKey(source, lookup.match, value);

    if (!matchResult || isEmpty(matchResult)) {
      return runtime.lookupResults.value.delete(lookup.fieldTarget);
    }
    runtime.lookupResults.value.set(lookup.fieldTarget, {
      label: lookup.schema.label,
      matchResult: lookup.schema.lookup?.format
        ? lookup.schema.lookup?.format(matchResult)
        : matchResult,
      // 有 match 配置，支持对象数组的匹配删除
      delete: createDeleteHandler(runtime, lookup.fieldTarget, lookup.match),
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
