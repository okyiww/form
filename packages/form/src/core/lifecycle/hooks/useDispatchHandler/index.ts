import {
  isConditionDispatch,
  isEventHandlerDispatch,
  isGetModelDispatch,
  isGetSharedDispatch,
  isRefsDispatch,
  isRequestDispatch,
  isSetModelDispatch,
  isSetSharedDispatch,
} from "@/core/lifecycle/hooks/useDispatchHandler/is";
import { processCompare } from "@/core/lifecycle/hooks/useDispatchHandler/processCompare";
import { processDynamicValue } from "@/core/lifecycle/hooks/useDispatchHandler/processDynamicValue";
import { processRequests } from "@/core/lifecycle/hooks/useDispatchHandler/processRequests";
import { processTransform } from "@/core/lifecycle/hooks/useDispatchHandler/processTransform";
import Runtime from "@/core/runtime";
import { raw } from "@/helpers";
import { get, isArray, isString, set } from "lodash";
import { nextTick } from "vue";

export const requestResSymbol = Symbol("requestRes");
export const requestErrSymbol = Symbol("requestErr");
export const eventArgsSymbol = Symbol("eventArgs");

export async function processDispatch(
  data: AnyObject,
  utils: AnyObject,
  runtime: Runtime,
  runtimeInfo?: AnyObject
): Promise<any> {
  if (!runtime.ssr.definitions?.dispatch) return;
  const dispatch = data[runtime.ssr.definitions?.dispatch];

  if (isRequestDispatch(dispatch)) {
    return await processRequests(dispatch, data, utils, runtime, runtimeInfo)
      .then((res) => {
        // 使用 settimeout 是因为我 form 代码里本身就已经有了 nextTick 的控制，如果直接使用 nextTick 会无法获取最新数据
        let requestRes = data.path ? get(res, data.path) : res;
        if ("transform" in data) {
          requestRes = processTransform(requestRes, data.transform);
        }
        setTimeout(() => {
          if ("then" in data) {
            processDispatch(data.then, utils, runtime, {
              [requestResSymbol]: {
                parentRes: runtimeInfo?.[requestResSymbol],
                ...requestRes,
              },
            });
          }
        });

        return requestRes;
      })
      .catch((err) => {
        if ("catch" in data) {
          processDispatch(data.catch, utils, runtime, {
            [requestErrSymbol]: err,
          });
        }
      });
  }
  if (isConditionDispatch(dispatch)) {
    await nextTick(); // 用于获取最新数据
    if (isArray(data.and)) {
      const promises = data.and.map((condition: AnyObject) => {
        return processCompare(condition, utils, runtime, runtimeInfo);
      });
      const conditionResults = (await Promise.all(promises)).every(Boolean);
      if (conditionResults && "then" in data) {
        return processDispatch(data.then, utils, runtime, runtimeInfo);
      }
      if (!conditionResults && "else" in data) {
        return processDispatch(data.else, utils, runtime, runtimeInfo);
      }
      return conditionResults;
    }
    if (isArray(data.or)) {
      const promises = data.or.map((condition: AnyObject) => {
        return processCompare(condition, utils, runtime, runtimeInfo);
      });
      const conditionResults = (await Promise.all(promises)).some(Boolean);
      if (conditionResults && "then" in data) {
        return processDispatch(data.then, utils, runtime, runtimeInfo);
      }
      if (!conditionResults && "else" in data) {
        return processDispatch(data.else, utils, runtime, runtimeInfo);
      }
      return conditionResults;
    }

    const conditionResult = await processCompare(
      data,
      utils,
      runtime,
      runtimeInfo
    );
    if (!("then" in data || "else" in data)) {
      return conditionResult;
    }
    if (conditionResult && "then" in data) {
      return processDispatch(data.then, utils, runtime, runtimeInfo);
    }
    if (!conditionResult && "else" in data) {
      return processDispatch(data.else, utils, runtime, runtimeInfo);
    }
  }

  if (isEventHandlerDispatch(dispatch)) {
    return raw((utils: AnyObject, ...args: AnyArray) => {
      data.pipes.forEach((pipe: AnyObject) => {
        processDispatch(pipe, utils, runtime, {
          ...runtimeInfo,
          [eventArgsSymbol]: {
            parentArgs: runtimeInfo?.[eventArgsSymbol],
            ...args,
          },
        });
      });
    });
  }

  if (isSetModelDispatch(dispatch)) {
    if (isString(data.as)) {
      const setResult = set(
        runtime._model.model.value,
        data.field,
        processDynamicValue(data.as, utils, runtime, runtimeInfo)
      );
      if ("then" in data) {
        return processDispatch(data.then, utils, runtime, runtimeInfo);
      }
      return setResult;
    }
    const setResult = set(
      runtime._model.model.value,
      data.field,
      await processDispatch(data.as, utils, runtime, runtimeInfo)
    );
    if ("then" in data) {
      return processDispatch(data.then, utils, runtime, runtimeInfo);
    }
    return setResult;
  }

  if (isSetSharedDispatch(dispatch)) {
    if (isString(data.as)) {
      const setResult = set(
        runtime.shared,
        data.field,
        processDynamicValue(data.as, utils, runtime, runtimeInfo)
      );
      if ("then" in data) {
        return processDispatch(data.then, utils, runtime, runtimeInfo);
      }
      return setResult;
    }
    const setResult = set(
      runtime.shared,
      data.field,
      await processDispatch(data.as, utils, runtime, runtimeInfo)
    );
    if ("then" in data) {
      return processDispatch(data.then, utils, runtime, runtimeInfo);
    }
    return setResult;
  }

  if (isGetSharedDispatch(dispatch)) {
    return get(utils.shared, data.field);
  }

  if (isGetModelDispatch(dispatch)) {
    return get(runtime._model.model.value, data.field);
  }

  if (isRefsDispatch(dispatch)) {
    const targetRef = utils.refs.get(data.field);
    if (!targetRef) return;
    if (data.get) {
      return targetRef.value[data.get];
    }
    if (data.call) {
      targetRef.value[data.call](
        processDynamicValue(data.args, utils, runtime, runtimeInfo)
      );
    }
    return;
  }

  if (isArray(data)) {
    return data.map((item: AnyObject) =>
      processDispatch(item, utils, runtime, runtimeInfo)
    );
  }

  if (runtime.ssr.actions[dispatch]) {
    const processedData: AnyObject = {};
    for (const key of Object.keys(data)) {
      const value = await processDispatch(
        data[key],
        utils,
        runtime,
        runtimeInfo
      );
      processedData[key] = value;
    }
    return runtime.ssr.actions[dispatch](processedData, runtimeInfo);
  }

  return processDynamicValue(data, utils, runtime, runtimeInfo);
}

export function useDispatchHandler(data: any, runtime: Runtime) {
  return (utils: AnyObject) => {
    return processDispatch(data, utils, runtime);
  };
}
