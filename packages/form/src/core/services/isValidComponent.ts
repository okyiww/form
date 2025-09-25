import { isPlainObject } from "lodash";

// TODO: 需要有类型上的约束，当 component 和 layout 为对象时，认为是有效组件，因为从概念上来说，layout 的值只应该是字符串或者组件对象
// 所以这个函数除了判断本身的 component 还应该判断容器 layout 的值是否为组件对象
export function isValidComponent(propertyKey: string | undefined, value: any) {
  if (!propertyKey) return false;
  return ["component", "layout"].includes(propertyKey) && isPlainObject(value);
}
