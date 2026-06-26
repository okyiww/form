import Runtime from "@/core/runtime";
import { CustomAdapter, ResolvedKeys } from "@/helpers/defineFormSetup/types";

export class ArcoVueAdapter implements CustomAdapter {
  constructor(public runtime: Runtime) {}

  formModelName = "model";
  formModelKey = "field";

  validate(): Promise<void> {
    return new Promise((resolve, reject) => {
      return this.runtime._render.formRef.value.validate((errors: any) => {
        errors ? reject(errors) : resolve();
      });
    });
  }

  resolveKeys(componentProps: any): ResolvedKeys | null {
    const fieldNames = componentProps?.fieldNames;
    if (!fieldNames) return null;
    return {
      labelKey: fieldNames.label ?? fieldNames.title ?? "label",
      valueKey: fieldNames.value ?? fieldNames.key ?? "value",
      childrenKey: fieldNames.children ?? "children",
    };
  }
}
