/**
 * TODO：一种简单的布局计算，可能带来的问题是在存在 px 转换的情况下，这个布局不会很精准，16px 和实际的项目 px 可能存在差异
 * 后续有需要的话可以提供一个 px 的定义器，毕竟移动端上需要这种布局的场景也不多
 */

export function useLayoutStyle(schema: AnyObject, layoutGap = 16) {
  if (!schema.span)
    return {
      width: "100%",
    };

  const gap = layoutGap;
  const layoutCount = 24 / (schema.span ?? 24);
  return {
    width: `calc(${((schema.span ?? 24) / 24) * 100}% - ${
      ((schema.span ?? 24) / 24) * gap * (layoutCount - 1)
    }px)`,
    display: "inline-block",
    boxSizing: "border-box",
    verticalAlign: "top",
  };
}
