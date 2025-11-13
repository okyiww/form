import { FormContext } from "@/core/context";

export function useSPTypeHandler(value: any) {
  return async ({ model }) => {
    console.log("model", model.name);
    return await FormContext.ssr[value.__sp_type__]({ model, ...value });
  };
}
