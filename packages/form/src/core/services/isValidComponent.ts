import { isPlainObject } from "lodash";

export function isValidComponent(propertyKey: string | undefined, value: any) {
  if (!propertyKey) return false;
  return propertyKey === "component" && isPlainObject(value);
}
