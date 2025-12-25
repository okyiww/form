import { FormContext } from "@/core/context";
import Runtime from "@/core/runtime";

export function useFormProps(runtime: Runtime) {
  const _formModelName = runtime._adapter.adaptee.formModelName;
  const formProps = {
    [_formModelName]: runtime._model.model.value,
    ...(FormContext.context.default?.formProps ?? {}),
    ...runtime._options.formProps,
  };
  return formProps;
}
