import { FormContext } from "@/core/context";

export function useSPTypeHandler(value: any) {
  return async () => {
    return await FormContext.ssr[value.__sp_type__]({ ...value });
  };
}
