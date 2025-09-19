import { FormContext } from "@/core/context";
import { ParsedSchema } from "@/core/lifecycle/Schema/types";
import Runtime from "@/core/runtime";
import { get, set } from "lodash";
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
        <Component
          {...schema.componentProps}
          modelValue={get(this.runtime._model.model.value, schema.field)}
          onUpdate:modelValue={(value: any) => {
            set(this.runtime._model.model.value, schema.field, value);
          }}
        ></Component>
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
            {this.runtime._schema.parsedSchemas.value.map((schema) =>
              this.renderParsedSchema.bind(this)(schema)
            )}
          </this.meta.Form>
        );
      },
    });
  }
}
