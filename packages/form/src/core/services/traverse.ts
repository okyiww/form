import { isNumericLike } from "@/core/services/isNumericLike";
import { forEach, isEmpty } from "lodash";

export function wrapperNumericLike(value: string) {
  if (isNumericLike(value)) {
    return `[${value}]`;
  }
  return value;
}

export function traverse(
  tree: Record<string, any>,
  visitor: (node: any, key: string, parentKey?: string) => boolean | void,
  parentKey?: string
) {
  forEach(tree, (node, key) => {
    if (visitor(node, key, parentKey) === false) {
      return;
    }

    if (!isEmpty(node.children)) {
      traverse(
        node.children,
        visitor,
        parentKey
          ? `${wrapperNumericLike(parentKey)}.children.${wrapperNumericLike(
              key
            )}`
          : wrapperNumericLike(key)
      );
    }
  });
}
