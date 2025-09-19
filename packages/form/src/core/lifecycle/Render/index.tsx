import { FormContext } from "@/core/context";
import { ParsedSchema } from "@/core/lifecycle/Schema/types";
import Runtime from "@/core/runtime";
import { cloneDeep, get, set } from "lodash";
import { defineComponent, ref, watch } from "vue";

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

  renderItemSchema(
    schema: ParsedSchema,
    modelSource = this.runtime._model.model.value
  ) {
    const Component = schema.component;
    return (
      <this.meta.FormItem field={schema.field} label={schema.label}>
        <Component
          {...schema.componentProps}
          modelValue={get(modelSource, schema.field)}
          onUpdate:modelValue={(value: any) => {
            set(modelSource, schema.field, value);
          }}
        ></Component>
      </this.meta.FormItem>
    );
  }

  renderListSchema(schema: ParsedSchema) {
    // 这里使用 [{}] 是因为便于快速渲染出第一个空节点，避免因为还没处理完成导致页面一直不展示内容
    const listModel = get(this.runtime._model.model.value, schema.field) ?? [
      {},
    ];
    return (
      <this.meta.layouts.List>
        {{
          default: () => {
            return listModel.map((model: any) => (
              <this.meta.layouts.ListItem>
                {{
                  default: () => {
                    return schema.children.map((childSchema: any) => {
                      return this.renderItemSchema(childSchema, model);
                    });
                  },
                  delete: ({ render }: any) => {
                    const Delete = render();
                    return (
                      listModel.length > 1 && (
                        <Delete
                          disabled={!this.runtime._model.isAllConsumed()}
                          onClick={() => {
                            listModel.splice(listModel.indexOf(model), 1);
                          }}
                        />
                      )
                    );
                  },
                }}
              </this.meta.layouts.ListItem>
            ));
          },
          add: ({ render }: any) => {
            const Add = render();
            return (
              <Add
                disabled={!this.runtime._model.isAllConsumed()}
                onClick={() => {
                  const toBeAdded = cloneDeep(
                    this.runtime._model.immutableModel as any
                  )?.[schema.field]?.[0];
                  this.runtime._model.model.value[schema.field].push(toBeAdded);
                }}
              />
            );
          },
        }}
      </this.meta.layouts.List>
    );
  }

  renderParsedSchema(schema: ParsedSchema) {
    switch (schema.type) {
      case "item":
        return this.renderItemSchema(schema);
      case "group":
        return this.renderItemSchema(schema);
      case "list":
        return this.renderListSchema(schema);
      default:
        return this.renderItemSchema(schema);
    }
  }

  render() {
    return defineComponent({
      setup: () => {
        return () => (
          <this.meta.Form model={this.runtime._model.model.value}>
            {this.runtime._schema.parsedSchemas.value.map((schema) =>
              this.renderParsedSchema.bind(this)(schema)
            )}
          </this.meta.Form>
        );
      },
    });
  }
}
