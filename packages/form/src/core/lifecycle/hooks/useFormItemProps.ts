import Runtime from "@/core/runtime";

export function useFormItemProps(
  runtime: Runtime,
  schema: any,
  baseFieldPath?: string
) {
  console.log("schema.formItemProps", schema.formItemProps);
  const _formModelKey = runtime._adapter.adaptee.formModelKey;
  const formItemProps = {
    [_formModelKey]: baseFieldPath
      ? `${baseFieldPath}.${schema.field}`
      : schema.field,
    ...schema.formItemProps,
  };
  return formItemProps;
}
