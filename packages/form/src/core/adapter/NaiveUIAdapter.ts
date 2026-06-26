import Runtime from "@/core/runtime";
import { CustomAdapter, ResolvedKeys } from "@/helpers/defineFormSetup/types";

export class NaiveUIAdapter implements CustomAdapter {
  constructor(public runtime: Runtime) {}

  formModelName = "model";
  formModelKey = "key";

  validate(): Promise<void> {
    return new Promise((resolve, reject) => {
      return this.runtime._render.formRef.value.validate((errors: any) => {
        errors ? reject(errors) : resolve();
      });
    });
  }

  // NaiveUI uses standalone labelField / valueField / keyField props
  resolveKeys(componentProps: any): ResolvedKeys | null {
    const labelKey = componentProps?.labelField;
    // TreeSelect uses keyField; Select uses valueField
    const valueKey = componentProps?.valueField ?? componentProps?.keyField;
    if (!labelKey && !valueKey) return null;
    return {
      labelKey: labelKey ?? "label",
      valueKey: valueKey ?? "value",
      childrenKey: "children",
    };
  }
}
