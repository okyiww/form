import { isNumber, isString } from "lodash";

export function isNumericLike(value: string) {
  if (isNumber(value)) return true;
  if (!isString(value)) return false;
  const integerRegex = /^-?\d+$/;
  return integerRegex.test(value);
}
