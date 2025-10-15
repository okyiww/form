import { isObject, merge } from "lodash";

export function once(value: any) {
  // happy path of any other types
  if (!isObject(value)) return value;

  return merge(value, {
    __okyiww_form_once__: true,
  });
}

export function isOnce(value: any) {
  return value?.__okyiww_form_once__ === true;
}
