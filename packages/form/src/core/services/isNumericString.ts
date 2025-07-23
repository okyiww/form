import { isString } from "lodash";

export function isNumericString(value: string) {
  if (!isString(value)) return false;
  const integerRegex = /^-?\d+$/;
  return integerRegex.test(value);
}
