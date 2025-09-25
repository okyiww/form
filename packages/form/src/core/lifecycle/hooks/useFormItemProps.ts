import Runtime from "@/core/runtime";

export function useFormItemProps(
  runtime: Runtime,
  schema: any,
  baseFieldPath?: string
) {
  const _formModelKey = runtime._adapter.adaptee.formModelKey;
  const formItemProps = {
    [_formModelKey]: baseFieldPath
      ? `${baseFieldPath}.${schema.field}`
      : schema.field,
  };
  return formItemProps;
}
