import { pickBy } from "lodash";

function transformValueToKey(target: AnyObject) {
  const transformed: AnyObject = {};
  for (const key in target) {
    target[key].forEach((value: string) => {
      transformed[value] = key;
    });
  }
  return transformed;
}

const namePlaceholderMap = transformValueToKey({
  请选择: ["select", "tree", "cascader"],
  请输入: ["input"],
});

export function usePlaceholder(label: string, componentName?: string) {
  if (!label) return;
  let placeholder = `请输入${label}`;
  Object.keys(namePlaceholderMap).forEach((key) => {
    if (componentName?.toLowerCase().includes(key.toLowerCase())) {
      placeholder = `${namePlaceholderMap[key]}${label}`;
    }
  });
  return placeholder;
}
