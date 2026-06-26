import Runtime from "@/core/runtime";
import { CustomAdapter, ResolvedKeys } from "@/helpers/defineFormSetup/types";

export class NutUIAdapter implements CustomAdapter {
  constructor(public runtime: Runtime) {}

  formModelName = "modelValue";
  formModelKey = "prop";

  validate(): Promise<void> {
    return new Promise((resolve, reject) => {
      return this.runtime._render.formRef.value
        .validate()
        .then(({ valid, errors }: { valid: boolean; errors: any }) => {
          valid ? resolve() : reject(errors);
        });
    });
  }

  resolveKeys(_componentProps: any): ResolvedKeys | null {
    return null;
  }
}
