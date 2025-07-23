import { FormContext } from "@/core/context";
import { ParsedSchema } from "@/core/lifecycle/Schema/types";
import Runtime from "@/core/runtime";
import { defineComponent } from "vue";

export default class Render {
  public meta;

  constructor(public runtime: Runtime) {
    this.meta = this.getRenderMeta();
  }

  getRenderMeta() {
    const template = FormContext.getTemplate(this.runtime._options.templateId);
    return {
      Form: template.providers.Form,
      FormItem: template.providers.FormItem,
      layouts: template.providers.layouts,
      adapters: {},
    };
  }

  renderItemSchema(schema: ParsedSchema) {
    const Component = schema.component;
    return (
      <this.meta.FormItem field={schema.field} label={schema.label}>
        <Component />
      </this.meta.FormItem>
    );
  }

  renderParsedSchema(schema: ParsedSchema) {
    switch (schema.type) {
      case "item":
        return this.renderItemSchema(schema);
      default:
        return this.renderItemSchema(schema);
    }
  }

  render() {
    return defineComponent({
      setup: () => {
        return () => (
          <this.meta.Form>
            {this.runtime._schema.parsedSchemas.value.map(
              this.renderParsedSchema.bind(this)
            )}
          </this.meta.Form>
        );
      },
    });
  }
}
