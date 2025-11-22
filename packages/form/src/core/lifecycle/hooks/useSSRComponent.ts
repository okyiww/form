import { FormContext } from "@/core/context";
import Runtime from "@/core/runtime";
import { isString } from "lodash";

export function useSSRComponent(componentName: string, runtime: Runtime) {
  if (isString(componentName)) {
    return async () => await runtime.ssr.renderComponent(componentName);
  }
  return componentName;
}
