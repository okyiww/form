/**
 * 表单执行器 (Form Runner)
 * 处理 useForm 的 Suspense 行为
 */
export function runForm<T>(formFunction: () => T): Promise<T> {
  return new Promise((resolve, reject) => {
    function executeForm() {
      try {
        const result = formFunction();
        resolve(result);
      } catch (thrownThing) {
        // 检查我们捕获到的是不是一个 Promise
        if (thrownThing instanceof Promise) {
          console.log("✋ 表单配置正在加载中，等待完成...");

          // 等待 Promise 完成
          thrownThing
            .then(() => {
              console.log("🔄 表单配置加载完成，重新执行...");
              // 完成后，重新运行原始函数
              executeForm();
            })
            .catch((error) => {
              console.error("🔥 表单配置加载失败:", error);
              reject(error);
            });
        } else {
          // 如果是真正的错误，就拒绝 Promise
          console.error("🔥 表单执行出错:", thrownThing);
          reject(thrownThing);
        }
      }
    }

    executeForm();
  });
}

/**
 * 同步版本的执行器
 * 用于不需要 Promise 的场景
 */
export function runFormSync<T>(
  formFunction: () => T,
  onSuspend?: (promise: Promise<any>) => void
): T | null {
  try {
    return formFunction();
  } catch (thrownThing) {
    if (thrownThing instanceof Promise) {
      console.log("✋ 表单配置正在加载中...");

      // 如果提供了回调，调用它
      if (onSuspend) {
        onSuspend(thrownThing);
      }

      return null;
    } else {
      // 如果是真正的错误，重新抛出
      throw thrownThing;
    }
  }
}
