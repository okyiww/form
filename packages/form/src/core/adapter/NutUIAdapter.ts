import Runtime from "@/core/runtime";
import { CustomAdapter } from "@/helpers/defineFormSetup/types";

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
}
