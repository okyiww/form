// 从给定路径中提取所有可能的父级路径
export function getParentPaths(path: string) {
  const parentPaths = [];

  // 使用正则表达式分割路径，保留分隔符
  const segments = path.split(/(\[|\]\.children\.|\])/);

  // 重新构建路径的各个层级
  let currentPath = "";
  let bracketCount = 0;

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];

    if (segment === "[") {
      currentPath += segment;
      bracketCount++;
    } else if (segment === "]") {
      currentPath += segment;
      bracketCount--;

      // 当括号平衡时，说明完成了一个完整的路径段
      if (bracketCount === 0 && currentPath.trim() !== "") {
        parentPaths.push(currentPath);
      }
    } else if (segment === "].children.") {
      currentPath += "]";
      if (bracketCount === 0 && currentPath.trim() !== "") {
        parentPaths.push(currentPath);
      }
      currentPath += ".children.";
      bracketCount = 0;
    } else if (segment && segment !== "") {
      currentPath += segment;
    }
  }

  return parentPaths;
}

// 更简洁的方法：直接从路径中提取直接父级
export function getDirectParent(path: string) {
  // 匹配最后一个 .children.[数字] 模式
  const match = path.match(/^(.+)\.children\.\[\d+\]$/);
  return match ? match[1] : null;
}

// 获取所有祖先路径（从直接父级到根级）
function getAllAncestorPaths(path: string) {
  const ancestors = [];
  let currentPath = path;

  while (true) {
    const parent = getDirectParent(currentPath);
    if (parent) {
      ancestors.push(parent);
      currentPath = parent;
    } else {
      break;
    }
  }

  return ancestors;
}

// 检查给定路径的父级是否存在于Map中
export function checkParentExists(map: Map<string, any>, childPath: string) {
  const directParent = getDirectParent(childPath);
  return directParent ? map.has(directParent) : false;
}

// 检查给定路径的所有祖先是否存在于Map中
export function checkRelations(map: Map<string, any>, childPath: string) {
  const ancestors = getAllAncestorPaths(childPath);
  const existingAncestors: string[] = [];

  // 首先添加当前路径本身（如果存在于 map 中）
  if (map.has(childPath)) {
    existingAncestors.push(childPath);
  }

  // 然后添加存在的祖先路径
  ancestors.forEach((ancestor) => {
    if (map.has(ancestor)) {
      existingAncestors.push(ancestor);
    }
  });

  return {
    isListChild: existingAncestors.length > 0,
    existingRelations: existingAncestors.map((ancestor) => {
      const current = map.get(ancestor);
      const directParent = getDirectParent(ancestor);
      const parent = directParent ? map.get(directParent) : null;

      return {
        current,
        parent,
      };
    }),
  };
}
