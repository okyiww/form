import { ArcoVueAdapter } from "@/core/adapter/ArcoVueAdapter";
import { FormContext } from "@/core/context";
import Runtime from "@/core/runtime";
import { CustomAdapter } from "@/helpers/defineFormSetup/types";

export default class Adapter {
  presetAdapters: Record<string, any>;
  adaptee: CustomAdapter = {} as CustomAdapter;

  constructor(public runtime: Runtime) {
    this.presetAdapters = {
      ArcoVue: new ArcoVueAdapter(runtime),
    };
    this.init();
  }

  init() {
    // TODO: improve type
    const template = FormContext.getTemplate(
      this.runtime._options.templateId
    ) as any;
    if (template.adapter) {
      console.log("template.adapter", template.adapter);
      const presetAdapter =
        this.presetAdapters[
          template.adapter as keyof typeof this.presetAdapters
        ] ?? {};
      this.adaptee = presetAdapter;
    }

    // custom 的优先级高于 preset
    if (template.customAdapter) {
      Object.keys(template.customAdapter).forEach((key) => {
        this.adaptee[key as keyof CustomAdapter] = () =>
          template.customAdapter[key as keyof CustomAdapter](this.runtime);
      });

      console.log("new this.adaptee", this.adaptee);
    }
  }
}
