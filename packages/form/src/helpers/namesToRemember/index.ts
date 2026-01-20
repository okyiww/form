import { isPlainObject, invert } from "lodash";

export function transformModelByRememberedNames(
  model: AnyObject,
  namesToRemember: Record<string, string>
): AnyObject {
  const transform = (data: any): any => {
    if (Array.isArray(data)) {
      return data.map((item) => transform(item));
    }

    if (isPlainObject(data)) {
      const result: AnyObject = {};
      for (const key of Object.keys(data)) {
        const newKey = namesToRemember[key] ?? key;
        result[newKey] = transform(data[key]);
      }
      return result;
    }

    return data;
  };

  return transform(model);
}

export function reverseTransformModelByRememberedNames(
  model: AnyObject,
  namesToRemember: Record<string, string>
): AnyObject {
  const reversedNames = invert(namesToRemember);

  const transform = (data: any): any => {
    if (Array.isArray(data)) {
      return data.map((item) => transform(item));
    }

    if (isPlainObject(data)) {
      const result: AnyObject = {};
      for (const key of Object.keys(data)) {
        const newKey = reversedNames[key] ?? key;
        result[newKey] = transform(data[key]);
      }
      return result;
    }

    return data;
  };

  return transform(model);
}
