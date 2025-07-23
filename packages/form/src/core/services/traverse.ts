import { forEach, isEmpty } from "lodash";

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
      traverse(node.children, visitor, key);
    }
  });
}
