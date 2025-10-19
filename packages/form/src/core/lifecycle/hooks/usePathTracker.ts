export function usePathTracker<T extends object>(
  target: T,
  onAccess: (path: string) => void
): T {
  const getDeepValueSafely = (path: string[]) => {
    let value: any = target;
    for (const key of path) {
      if (value === null || value === undefined) return undefined;
      value = value[key];
    }
    return value;
  };

  const createProxy = (path: string[]): any => {
    const currentValue = getDeepValueSafely(path);
    const proxyTarget = typeof currentValue === "function" ? () => {} : {};

    return new Proxy(proxyTarget, {
      get(_target, key) {
        if (key === "__raw__") {
          return currentValue;
        }

        if (
          key === "valueOf" ||
          key === "toString" ||
          key === Symbol.toPrimitive
        ) {
          return () => {
            const fullPath = path.join(".");
            const value = getDeepValueSafely(path);

            if (path.length > 0) onAccess(fullPath);

            if (key === "toString") {
              return typeof value === "object" && value !== null
                ? "[object Object]"
                : String(value);
            }

            return value;
          };
        }

        if (typeof key === "symbol") return undefined;

        const nextPath = [...path, String(key)];
        const nextValue = getDeepValueSafely(nextPath);

        if (
          nextValue === null ||
          nextValue === undefined ||
          (typeof nextValue !== "object" && typeof nextValue !== "function")
        ) {
          const fullPath = nextPath.join(".");
          onAccess(fullPath);
          return nextValue;
        }

        return createProxy(nextPath);
      },

      apply(_target, _thisArg, args) {
        const fullPath = path.join(".");
        if (path.length > 0) onAccess(fullPath);

        const func = getDeepValueSafely(path);
        if (typeof func === "function") {
          const parentPath = path.slice(0, -1);
          const parent = getDeepValueSafely(parentPath) || target;
          return func.apply(parent, args);
        }
        return undefined;
      },

      has(_target, key) {
        const currentValue = getDeepValueSafely(path);
        if (currentValue && typeof currentValue === "object") {
          return Reflect.has(currentValue, key);
        }
        return false;
      },

      getOwnPropertyDescriptor(_target, key) {
        const currentValue = getDeepValueSafely(path);

        if (currentValue && typeof currentValue === "object") {
          const desc = Reflect.getOwnPropertyDescriptor(currentValue, key);

          // 关键修复：确保描述符与代理目标兼容
          // 如果属性不可配置，我们需要确保它在目标上存在
          if (desc && !desc.configurable) {
            // 检查代理目标上是否有这个属性
            const targetDesc = Reflect.getOwnPropertyDescriptor(_target, key);
            if (!targetDesc) {
              // 如果代理目标上没有，返回一个可配置的版本
              return { ...desc, configurable: true };
            }
          }

          return desc;
        }

        return undefined;
      },

      ownKeys(_target) {
        const currentValue = getDeepValueSafely(path);
        if (currentValue && typeof currentValue === "object") {
          return Reflect.ownKeys(currentValue);
        }
        return [];
      },
    });
  };

  return createProxy([]);
}
