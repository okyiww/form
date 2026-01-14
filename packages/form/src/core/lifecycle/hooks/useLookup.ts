import { ParsedSchema } from "@/core/lifecycle/Schema/types";
import Runtime from "@/core/runtime";
import {
  get,
  isBoolean,
  isEmpty,
  isFunction,
  isObject,
  isString,
} from "lodash";

/**
 * 该函数就像是一个 pipe，在这个时候只记录处理定义和必要元信息，真正触发的时候再根据 path 去动态处理结果
 */

export function useLookup(
  schema: ParsedSchema,
  fieldTarget: string,
  runtime: Runtime
) {
  console.log("后面才执行");

  const lookup = runtime.lookups.value.get(fieldTarget);
  console.log("lookup", lookup);
  if (
    (lookup && lookup.source && lookup.match) ||
    lookup?.schema?.lookup === true
  ) {
    return;
  }
  let source = schema.lookup.source;
  // 默认字符串是定义的 componentProps 中的结果集
  if (isString(schema.lookup.source)) {
    source = get(schema.componentProps, schema.lookup.source);
  }
  runtime.lookups.value.set(fieldTarget, {
    source,
    match: schema.lookup.match,
    fieldTarget,
    schema,
  });
}

export function useLookupProcess(path: string, value: any, runtime: Runtime) {
  for (const lookup of runtime.lookups.value.values()) {
    console.log("lookup", lookup.fieldTarget, path);
    if (!(lookup.fieldTarget === path)) continue;
    if (lookup.schema.lookup === true) {
      if (!value) {
        runtime.lookupResults.value.delete(lookup.fieldTarget);
        return;
      }
      runtime.lookupResults.value.set(lookup.fieldTarget, {
        label: lookup.schema.label,
        matchResult: value,
      });
      return;
    }
    const matchResult = findByKey(lookup.source, lookup.match, value);
    console.log("22222222222", matchResult);
    if (!matchResult || isEmpty(matchResult)) {
      runtime.lookupResults.value.delete(lookup.fieldTarget);
      return;
    }
    runtime.lookupResults.value.set(lookup.fieldTarget, {
      label: lookup.schema.label,
      matchResult: lookup.schema.lookup?.format
        ? lookup.schema.lookup?.format(matchResult)
        : matchResult,
    });
  }
}

/**
 * 匹配函数类型
 * @param item - 当前遍历到的数据项
 * @param value - 要匹配的单个值
 */
type MatchFn<T = unknown> = (item: T, value: unknown) => boolean;

/**
 * 在任意数据结构中查找匹配的数据
 * @param data - 任意数据结构（数组、对象、树，甚至是非法值）
 * @param matcher - 字段名或自定义匹配函数
 * @param value - 要匹配的值，可以是单个值或数组
 * @returns 单个值时返回匹配项或 undefined，数组时返回匹配项数组
 */
function findByKey<T = unknown>(
  data: unknown,
  matcher: string | MatchFn,
  value: unknown
): T | undefined | T[] {
  // 如果 value 是数组，批量匹配
  if (Array.isArray(value)) {
    const results: T[] = [];
    for (const val of value) {
      const result = findSingle<T>(data, matcher, val);
      if (result !== undefined) {
        results.push(result);
      }
    }
    return results;
  }

  // 单个值匹配
  return findSingle<T>(data, matcher, value);
}

/**
 * 查找单个匹配项（内部函数）
 */
function findSingle<T = unknown>(
  data: unknown,
  matcher: string | MatchFn,
  value: unknown
): T | undefined {
  if (data === null || data === undefined) {
    return undefined;
  }

  if (typeof data !== "object") {
    return undefined;
  }

  // 统一匹配逻辑
  const isMatch = (item: unknown): boolean => {
    if (item === null || typeof item !== "object") return false;

    if (typeof matcher === "function") {
      return matcher(item, value);
    } else {
      const obj = item as Record<string, unknown>;
      return (
        Object.prototype.hasOwnProperty.call(obj, matcher) &&
        obj[matcher] === value
      );
    }
  };

  // 数组：遍历每个元素
  if (Array.isArray(data)) {
    for (const item of data) {
      if (item !== null && typeof item === "object" && isMatch(item)) {
        return item as T;
      }
      const result = findSingle<T>(item, matcher, value);
      if (result !== undefined) {
        return result;
      }
    }
    return undefined;
  }

  // 普通对象：先检查自身
  if (isMatch(data)) {
    return data as T;
  }

  // 递归搜索子属性
  for (const prop of Object.values(data)) {
    const result = findSingle<T>(prop, matcher, value);
    if (result !== undefined) {
      return result;
    }
  }

  return undefined;
}
