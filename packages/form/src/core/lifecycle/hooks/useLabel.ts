import { isString } from "lodash";

export function useLabel(label: string | AnyFunction, baseFieldPath?: string) {
  if (!label) return;
  if (!baseFieldPath || isString(label)) {
    return label;
  }
  const index = baseFieldPath.split(".").pop();
  return label(index);
}
