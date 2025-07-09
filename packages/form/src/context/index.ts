import { FormSetupLoader } from "./types";

export class FormContext {
  static context: any;

  static parseLoader(loader: FormSetupLoader) {
    return loader().then((module) => {
      this.context = module.default;
    });
  }
}
