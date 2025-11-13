import {
  DefineFormSetupOptions,
  Template,
} from "@/helpers/defineFormSetup/types";
import { FormSetupLoader } from "../lifecycle/types";
import { keyBy } from "lodash";

export class FormContext {
  static context: DefineFormSetupOptions;
  static templateById: Record<
    string,
    DefineFormSetupOptions["templates"][number]
  >;
  static isSsr = false;
  static ssr = {} as AnyObject;

  static processContext() {
    this.templateById = keyBy(this.context.templates, "id");
  }

  static parseLoader(loader: FormSetupLoader) {
    return loader().then((module) => {
      this.context = module.default;
      this.processContext();
    });
  }

  static getTemplate(templateId = this.context.default.templateId): Template {
    return this.templateById[templateId];
  }
}
