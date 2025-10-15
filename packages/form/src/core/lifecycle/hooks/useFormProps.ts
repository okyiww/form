import Runtime from "@/core/runtime";

export function useFormProps(runtime: Runtime) {
  const _formModelName = runtime._adapter.adaptee.formModelName;
  const formProps = {
    [_formModelName]: runtime._model.model.value,
    ...runtime._options.formProps,
  };
  return formProps;
}
