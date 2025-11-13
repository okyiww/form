export interface TraverseContext {
  /**
   * 当前节点在父节点中的 key（如果是数组，则为索引）
   */
  key: string | number;
  /**
   * 从根到当前节点的路径数组
   */
  path: (string | number)[];
  /**
   * 当前节点的父节点（对象或数组）
   */
  parent: any;
  /**
   * 检查当前节点是否为叶子节点（没有子节点）
   */
  isLeaf: boolean;
}

/**
 * 遍历处理函数
 * @param value 当前节点的值
 * @param context 当前节点的上下文
 * @returns 返回新值。
 * - 返回 `SKIP`：跳过子节点遍历。
 * - 返回 `DELETE`：删除此节点。
 * - 返回其他值：用该值替换当前节点。
 */
export type TraverseHandler = (value: any, context: TraverseContext) => any;

// --- 主函数 ---

/**
 * 深度遍历一个对象或数组，并允许通过 handler "原地" 修改、跳过或删除节点。
 * @param target 要遍历的对象或数组
 * @param handler 在每个节点上调用的处理函数
 * @returns 经过 handler 修改后的原始对象 (in-place)
 */
export function deepTraverse<T extends object>(
  target: T,
  handler: TraverseHandler
): T {
  /**
   * 内部递归函数
   * @param current 当前正在遍历的值
   * @param path 到达 `current` 的路径
   */
  function traverseRecursive(current: any, path: (string | number)[]) {
    // 检查是否为对象或数组，如果不是，则无法“深入”
    if (typeof current !== "object" || current === null) {
      return;
    }

    // 1. 处理数组
    if (Array.isArray(current)) {
      // **关键**：使用标准 for 循环（而不是 forEach），
      // 因为我们需要在 `DELETE` 操作后安全地修改索引 (index--)。
      for (let index = 0; index < current.length; index++) {
        const value = current[index];
        const isLeaf = typeof value !== "object" || value === null;

        const context: TraverseContext = {
          key: index,
          path: [...path, index],
          parent: current,
          isLeaf: isLeaf,
        };

        const result = handler(value, context);

        current[index] = result;

        // 如果新值是可遍历的（且未被跳过），则递归
        if (typeof result === "object" && result !== null) {
          traverseRecursive(result, context.path);
        }
      }
    }
    // 2. 处理纯对象
    else {
      // 使用 Object.keys 遍历
      const keys = Object.keys(current);
      for (const key of keys) {
        const value = current[key];
        const isLeaf = typeof value !== "object" || value === null;

        const context: TraverseContext = {
          key: key,
          path: [...path, key],
          parent: current,
          isLeaf: isLeaf,
        };

        // --- 调用 Handler 并处理结果 ---
        const result = handler(value, context);

        // 原地替换
        current[key] = result;

        // 如果新值是可遍历的（且未被跳过），则递归
        if (typeof result === "object" && result !== null) {
          traverseRecursive(result, context.path);
        }
      }
    }
  }

  // 开始遍历。
  // 注意：我们不处理根节点本身，只处理它的子节点。
  // (与 `traverse` 库不同，`traverse` 会访问根节点)
  // 这种设计更符合 "原地" 替换的直觉。
  traverseRecursive(target, []);

  // 返回被修改的原始对象
  return target;
}
