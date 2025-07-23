import { isFunction, isObject } from "lodash";

export function isPromise(value: any) {
  return (
    value instanceof Promise ||
    (isObject(value) &&
      isFunction((value as any)?.then) &&
      isFunction((value as any)?.catch))
  );
}
