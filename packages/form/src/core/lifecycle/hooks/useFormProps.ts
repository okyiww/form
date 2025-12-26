import { FormContext } from "@/core/context";
import Runtime from "@/core/runtime";

export function useFormProps(runtime: Runtime) {
  const formProps = {
    ...(FormContext.context.default?.formProps ?? {}),
    ...runtime._options.formProps,
  };
  return formProps;
}
