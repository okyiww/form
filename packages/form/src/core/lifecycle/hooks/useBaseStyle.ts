// TODO 后续加入 px 转换器，使得一些需要转换的场景可以统一处理合适的间距

import { FormContext } from "@/core/context";

export function useBaseStyle(value?: number): AnyObject {
  const gap = value ?? FormContext.context.default?.layoutGap ?? 16;
  return {
    gap: `${gap}px`,
    width: "100%",
    height: "100%",
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    background: FormContext.context.default?.gapBgColor ?? "transparent",
  };
}

export function useListBaseStyle(value?: number): AnyObject {
  const gap = value ?? FormContext.context.default?.listLayoutGap ?? 16;
  return {
    gap: `${gap}px`,
    width: "100%",
    height: "100%",
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    background: FormContext.context.default?.gapBgColor ?? "transparent",
  };
}
