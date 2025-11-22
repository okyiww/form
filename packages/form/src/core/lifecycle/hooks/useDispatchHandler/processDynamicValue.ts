import {
  requestErrSymbol,
  requestResSymbol,
} from "@/core/lifecycle/hooks/useDispatchHandler";
import Runtime from "@/core/runtime";
import { get, isString, escapeRegExp, isArray, isPlainObject } from "lodash";

export function isDynamicValue(value: string, runtime: Runtime) {
  const modelDefinition = runtime.ssr.definitions?.model;
  const sharedDefinition = runtime.ssr.definitions?.shared;
  const resDefinition = runtime.ssr.definitions?.res;
  const errDefinition = runtime.ssr.definitions?.err;
  if (modelDefinition && value.includes(modelDefinition)) {
    return true;
  }
  if (sharedDefinition && value.includes(sharedDefinition)) {
    return true;
  }
  if (resDefinition && value.includes(resDefinition)) {
    return true;
  }
  if (errDefinition && value.includes(errDefinition)) {
    return true;
  }
  return false;
}

// 处理可能是动态数据的情况, 数据由于都是 ssr 进来的，所以一定是 string
export function processDynamicValue(
  value: string,
  { model, shared }: AnyObject,
  runtime: Runtime,
  runtimeInfo?: AnyObject
): any {
  const modelDefinition = runtime.ssr.definitions?.model;
  const sharedDefinition = runtime.ssr.definitions?.shared;
  const resDefinition = runtime.ssr.definitions?.res;
  const errDefinition = runtime.ssr.definitions?.err;

  if (!isString(value)) {
    if (isArray(value)) {
      return processArrayDynamic(
        value,
        { model, shared },
        runtime,
        runtimeInfo
      );
    }
    if (isPlainObject(value)) {
      return processPlainObjectDynamic(
        value,
        { model, shared },
        runtime,
        runtimeInfo
      );
    }
    return value;
  }

  if (modelDefinition) {
    const escaped = escapeRegExp(modelDefinition);
    const exactMatch = new RegExp(`^${escaped}\\.([\\w\\.\\[\\]]+)$`).exec(
      value
    );
    if (exactMatch) {
      return get(model, exactMatch[1]);
    }
  }

  if (sharedDefinition) {
    const escaped = escapeRegExp(sharedDefinition);
    const exactMatch = new RegExp(`^${escaped}\\.([\\w\\.\\[\\]]+)$`).exec(
      value
    );
    if (exactMatch) {
      return get(shared, exactMatch[1]);
    }
  }

  if (resDefinition) {
    const escaped = escapeRegExp(resDefinition);
    const exactMatch = new RegExp(`^${escaped}\\.([\\w\\.\\[\\]]+)$`).exec(
      value
    );
    if (exactMatch) {
      return get(runtimeInfo?.[requestResSymbol], exactMatch[1]);
    }
  }

  if (errDefinition) {
    const escaped = escapeRegExp(errDefinition);
    const exactMatch = new RegExp(`^${escaped}\\.([\\w\\.\\[\\]]+)$`).exec(
      value
    );
    if (exactMatch) {
      return get(runtimeInfo?.[requestErrSymbol], exactMatch[1]);
    }
  }

  let processed = value;

  if (modelDefinition) {
    const escaped = escapeRegExp(modelDefinition);
    processed = processed.replace(
      new RegExp(`${escaped}\\.([\\w\\.\\[\\]]+)`, "g"),
      (_, path) => {
        const res = get(model, path);
        return res === undefined || res === null ? "" : String(res);
      }
    );
  }

  if (sharedDefinition) {
    const escaped = escapeRegExp(sharedDefinition);
    processed = processed.replace(
      new RegExp(`${escaped}\\.([\\w\\.\\[\\]]+)`, "g"),
      (_, path) => {
        const res = get(shared, path);
        return res === undefined || res === null ? "" : String(res);
      }
    );
  }

  return processed;
}

export function processArrayDynamic(
  value: any[],
  { model, shared }: AnyObject,
  runtime: Runtime,
  runtimeInfo?: AnyObject
) {
  return value.map((item) =>
    processDynamicValue(item, { model, shared }, runtime, runtimeInfo)
  );
}

export function processPlainObjectDynamic(
  value: Record<string, any>,
  { model, shared }: AnyObject,
  runtime: Runtime,
  runtimeInfo?: AnyObject
) {
  return Object.fromEntries(
    Object.entries(value).map(([key, value]) => [
      key,
      processDynamicValue(value, { model, shared }, runtime, runtimeInfo),
    ])
  );
}
