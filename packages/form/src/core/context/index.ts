import { DefineFormSetupOptions } from "@/helpers/defineFormSetup/types";
import { FormSetupLoader } from "./types";
import { keyBy } from "lodash";

export class FormContext {
  static context: DefineFormSetupOptions;
  static templateById: Record<
    string,
    DefineFormSetupOptions["templates"][number]
  >;

  static processContext() {
    this.templateById = keyBy(this.context.templates, "id");
  }

  static parseLoader(loader: FormSetupLoader) {
    return loader().then((module) => {
      this.context = module.default;
      this.processContext();
    });
  }

  static getTemplate(templateId = this.context.default.templateId) {
    return this.templateById[templateId];
  }
}
