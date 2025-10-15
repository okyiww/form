// TODO 后续加入 px 转换器，使得一些需要转换的场景可以统一处理合适的间距

export function useBaseStyle(value = 16): AnyObject {
  return {
    gap: `${value}px`,
    width: "100%",
    height: "100%",
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "flex-start",
  };
}
