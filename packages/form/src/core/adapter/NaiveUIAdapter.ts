import Runtime from "@/core/runtime";
import { CustomAdapter } from "@/helpers/defineFormSetup/types";

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
}
