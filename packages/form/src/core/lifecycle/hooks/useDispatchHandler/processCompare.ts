import { processDispatch } from "@/core/lifecycle/hooks/useDispatchHandler";
import { processDynamicValue } from "@/core/lifecycle/hooks/useDispatchHandler/processDynamicValue";
import Runtime from "@/core/runtime";
import { isArray, isString } from "lodash";

/**
 * skipProcess 的引入是为了支持 left 和 right 以及 rightValues 都是 dispatch 的情况
 * 但由于不推荐进行超级定制的 dispatch，因为数据本身就已经在后端了，能够尽可能拼好的不需要太动态的可以略过
 * 所以这里不做深度的处理，只处理第一层的情况
 */

export async function processCompare(
  data: AnyObject,
  utils: AnyObject,
  runtime: Runtime,
  runtimeInfo?: AnyObject,
  skipProcess = false
) {
  if ((!isString(data.left) || !isString(data.right)) && !skipProcess) {
    let leftValue,
      rightValue,
      rightValues: AnyArray = [];
    if (!isString(data.left)) {
      leftValue = await processDispatch(
        data.left as unknown as AnyObject,
        utils,
        runtime,
        runtimeInfo
      );
      data.left = leftValue;
    }
    if (!isString(data.right)) {
      if (isArray(data.right)) {
        const promises = data.right.map((v: any) => {
          return processDispatch(
            v as unknown as AnyObject,
            utils,
            runtime,
            runtimeInfo
          );
        });

        await Promise.all(promises).then((res) => {
          rightValues = res;
        });
        data.right = rightValues;
      } else {
        rightValue = await processDispatch(
          data.right as unknown as AnyObject,
          utils,
          runtime,
          runtimeInfo
        );
        data.right = rightValue;
      }
    }

    return processCompare(data, utils, runtime, runtimeInfo, true);
  }
  const leftValue = processDynamicValue(data.left, utils, runtime, runtimeInfo);
  const rightValue = processDynamicValue(
    data.right,
    utils,
    runtime,
    runtimeInfo
  );

  const rightValues = isArray(data.right)
    ? data.right.map((v: any) =>
        processDynamicValue(v, utils, runtime, runtimeInfo)
      )
    : isArray(data.values)
    ? data.values.map((v: any) =>
        processDynamicValue(v, utils, runtime, runtimeInfo)
      )
    : null;

  // 单值比较操作符
  if (data.op === "eq") {
    return leftValue === rightValue;
  }
  if (data.op === "ne") {
    return leftValue !== rightValue;
  }
  if (data.op === "gt") {
    return leftValue > rightValue;
  }
  if (data.op === "ge" || data.op === "gte") {
    return leftValue >= rightValue;
  }
  if (data.op === "lt") {
    return leftValue < rightValue;
  }
  if (data.op === "le" || data.op === "lte") {
    return leftValue <= rightValue;
  }

  // 多值操作符
  if (data.op === "between") {
    if (!rightValues || rightValues.length < 2) return false;
    return leftValue >= rightValues[0] && leftValue <= rightValues[1];
  }
  if (data.op === "not_between") {
    if (!rightValues || rightValues.length < 2) return true;
    return leftValue < rightValues[0] || leftValue > rightValues[1];
  }
  if (data.op === "in") {
    if (!rightValues || rightValues.length === 0) return false;
    return rightValues.includes(leftValue);
  }
  if (data.op === "not_in") {
    if (!rightValues || rightValues.length === 0) return true;
    return !rightValues.includes(leftValue);
  }

  // 字符串匹配操作符（单值）
  const leftStr = String(leftValue);
  const rightStr = String(rightValue);

  if (data.op === "like") {
    if (rightValues && rightValues.length > 0) {
      // 多值过滤，以OR拼接
      return rightValues.some((v: any) => leftStr.includes(String(v)));
    }
    // 单值过滤
    return leftStr.includes(rightStr);
  }
  if (data.op === "not_like") {
    if (rightValues && rightValues.length > 0) {
      // 多值过滤，以OR拼接（不包含任何一个）
      return !rightValues.some((v: any) => leftStr.includes(String(v)));
    }
    // 单值过滤
    return !leftStr.includes(rightStr);
  }
  if (data.op === "like_left") {
    if (rightValues && rightValues.length > 0) {
      // 多值过滤，以OR拼接
      return rightValues.some((v: any) => leftStr.startsWith(String(v)));
    }
    // 单值过滤
    return leftStr.startsWith(rightStr);
  }
  if (data.op === "not_like_left") {
    if (rightValues && rightValues.length > 0) {
      // 多值过滤，以OR拼接（不以任何一个开头）
      return !rightValues.some((v: any) => leftStr.startsWith(String(v)));
    }
    // 单值过滤
    return !leftStr.startsWith(rightStr);
  }
  if (data.op === "like_right") {
    if (rightValues && rightValues.length > 0) {
      // 多值过滤，以OR拼接
      return rightValues.some((v: any) => leftStr.endsWith(String(v)));
    }
    // 单值过滤
    return leftStr.endsWith(rightStr);
  }
  if (data.op === "not_like_right") {
    if (rightValues && rightValues.length > 0) {
      // 多值过滤，以OR拼接（不以任何一个结尾）
      return !rightValues.some((v: any) => leftStr.endsWith(String(v)));
    }
    // 单值过滤
    return !leftStr.endsWith(rightStr);
  }

  return false;
}
