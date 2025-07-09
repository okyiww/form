import { FormContext } from "@/core/context";
import { InitFormOptions } from "@/helpers/initForm/types";

export const initForm = {
  install(app: any, options: InitFormOptions) {
    const { loader } = options;
    if (!loader) {
      throw new Error("loader is required.");
    }
    const originalMount = app.mount;
    app.mount = async (rootContainer: string) => {
      await FormContext.parseLoader(loader);
      return originalMount(rootContainer);
    };
  },
};
