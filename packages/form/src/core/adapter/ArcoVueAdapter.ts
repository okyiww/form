import Runtime from "@/core/runtime";
import { CustomAdapter } from "@/helpers/defineFormSetup/types";

export class ArcoVueAdapter implements CustomAdapter {
  constructor(public runtime: Runtime) {}

  validate(): Promise<void> {
    console.log("runtime", this.runtime);
    return Promise.resolve();
  }
}
