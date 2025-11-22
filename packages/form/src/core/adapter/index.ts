import { ArcoVueAdapter } from "@/core/adapter/ArcoVueAdapter";
import { NaiveUIAdapter } from "@/core/adapter/NaiveUIAdapter";
import { NutUIAdapter } from "@/core/adapter/NutUIAdapter";
import { FormContext } from "@/core/context";
import Runtime from "@/core/runtime";
import { CustomAdapter } from "@/helpers/defineFormSetup/types";
import { isFunction } from "lodash";

export default class Adapter {
  presetAdapters: Record<string, any>;
  adaptee: CustomAdapter = {} as CustomAdapter;

  constructor(public runtime: Runtime) {
    this.presetAdapters = {
      ArcoVue: new ArcoVueAdapter(runtime),
      NutUI: new NutUIAdapter(runtime),
      NaiveUI: new NaiveUIAdapter(runtime),
    };
    this.initAdapters();
  }

  initAdapters() {
    // TODO: improve type
    const template = FormContext.getTemplate(
      this.runtime._options.templateId
    ) as any;
    if (template.adapter) {
      const presetAdapter =
        this.presetAdapters[
          template.adapter as keyof typeof this.presetAdapters
        ] ?? {};
      this.adaptee = presetAdapter;
    }

    // custom 的优先级高于 preset
    if (template.customAdapter) {
      Object.keys(template.customAdapter).forEach((key) => {
        const adapter = template.customAdapter[key as keyof CustomAdapter];
        if (isFunction(adapter)) {
          // @ts-expect-error
          this.adaptee[key as keyof CustomAdapter] = () =>
            adapter(this.runtime);
        } else {
          this.adaptee[key as keyof CustomAdapter] = adapter;
        }
      });
    }
  }
}
