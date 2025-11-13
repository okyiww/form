import { FormContext } from "@/core/context";
import { isString } from "lodash";

export function useSSRComponent(componentName: string) {
  if (isString(componentName)) {
    return async () => await FormContext.ssr.renderComponent(componentName);
  }
  return componentName;
}
