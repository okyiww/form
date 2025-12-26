import { FormContext } from "@/core/context";
import {
  useBaseStyle,
  useListBaseStyle,
} from "@/core/lifecycle/hooks/useBaseStyle";
import { useFormItemProps } from "@/core/lifecycle/hooks/useFormItemProps";
import { useFormProps } from "@/core/lifecycle/hooks/useFormProps";
import { useLabel } from "@/core/lifecycle/hooks/useLabel";
import { useLayout } from "@/core/lifecycle/hooks/useLayout";
import { useLayoutStyle } from "@/core/lifecycle/hooks/useLayoutStyle";
import { usePlaceholder } from "@/core/lifecycle/hooks/usePlaceholder";
import { useRules } from "@/core/lifecycle/hooks/useRules";
import { ParsedSchema } from "@/core/lifecycle/Schema/types";
import Runtime from "@/core/runtime";
import { cloneDeep, get, isBoolean, isString, set } from "lodash";
import { defineComponent, ref, toRaw } from "vue";

export default class Render {
  public meta;
  public formRef = ref();

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
    modelSource = this.runtime._model.model.value,
    baseFieldPath?: string,
    Layout?: any
  ) {
    const fieldTarget = baseFieldPath
      ? `${baseFieldPath}.${schema.field}`
      : schema.field;
    const componentRef = ref();
    // 收集 refs 以供 helpers 使用
    this.runtime._schema.refs.set(fieldTarget, componentRef);
    const Component = toRaw(schema.component);
    if (!Component) return;
    const formItemProps = useFormItemProps(this.runtime, schema, baseFieldPath);
    const show = isBoolean(schema.show) ? schema.show : true;
    const label = useLabel(schema.label, baseFieldPath);
    const placeholder = usePlaceholder(label, Component.name);

    return (
      show && (
        <Layout style={useLayoutStyle(schema, this.runtime._options.layoutGap)}>
          <this.meta.FormItem
            {...formItemProps}
            label={label}
            rules={useRules(schema)}
          >
            {{
              ...schema.formItemSlots,
              default: () => (
                <Component
                  ref={componentRef}
                  modelValue={get(modelSource, schema.field)}
                  onUpdate:modelValue={(value: any) => {
                    set(modelSource, schema.field, value);
                  }}
                  placeholder={placeholder}
                  {...schema.componentProps}
                ></Component>
              ),
            }}
          </this.meta.FormItem>
        </Layout>
      )
    );
  }

  renderListSchema(
    schema: ParsedSchema,
    modelSource = this.runtime._model.model.value,
    baseFieldPath?: string,
    baseModelPath?: string,
    Layout?: any
  ) {
    // 这里使用 [{}] 是因为便于快速渲染出第一个空节点，避免因为还没处理完成导致页面一直不展示内容
    const listModel = get(modelSource, schema.field) ?? [{}];
    return (
      <Layout.List
        style={useLayoutStyle(schema, this.runtime._options.layoutGap)}
      >
        {{
          default: () => {
            return listModel.map((model: any, modelIndex: number) => (
              <Layout.ListItem>
                {{
                  default: () => {
                    return (
                      <div
                        style={useListBaseStyle(
                          this.runtime._options.listLayoutGap
                        )}
                      >
                        {schema.children.map((childSchema: any) => {
                          return this.renderParsedSchema(
                            childSchema,
                            model,
                            baseFieldPath
                              ? `${baseFieldPath}.${schema.field}.${modelIndex}`
                              : `${schema.field}.${modelIndex}`,
                            baseModelPath
                              ? `${baseModelPath}.${schema.field}.[${0}]`
                              : `${schema.field}.[${0}]`
                          );
                        })}
                      </div>
                    );
                  },
                  delete: ({ render }: any) => {
                    const Delete = render();
                    const minLen = schema.minLen ?? 1;
                    return (
                      listModel.length > minLen && (
                        <Delete
                          disabled={!this.runtime._model.allConsumed.value}
                          onClick={() => {
                            listModel.splice(listModel.indexOf(model), 1);
                          }}
                        />
                      )
                    );
                  },
                }}
              </Layout.ListItem>
            ));
          },
          add: ({ render }: any) => {
            const Add = render();
            return (
              <Add
                disabled={!this.runtime._model.allConsumed.value}
                onClick={() => {
                  const baseModel = `${
                    baseModelPath
                      ? `${baseModelPath}.${schema.field}.[0]`
                      : `${schema.field}.[0]`
                  }`;
                  const toBeAdded = get(
                    this.runtime._model.immutableModel,
                    baseModel
                  );
                  modelSource[schema.field].push(cloneDeep(toBeAdded));
                }}
              />
            );
          },
        }}
      </Layout.List>
    );
  }

  renderGroupSchema(
    schema: ParsedSchema,
    modelSource = this.runtime._model.model.value,
    baseFieldPath?: string,
    Layout?: any
  ) {
    return (
      <Layout style={useLayoutStyle(schema, this.runtime._options.layoutGap)}>
        {{
          default: () => {
            return schema.children.map((childSchema: any) => {
              return this.renderParsedSchema(
                childSchema,
                modelSource,
                baseFieldPath
              );
            });
          },
        }}
      </Layout>
    );
  }

  renderParsedSchema(
    schema: ParsedSchema,
    modelSource = this.runtime._model.model.value,
    baseFieldPath?: string,
    baseModelPath?: string
  ) {
    const Layout = useLayout(this.runtime, schema);
    switch (schema.type) {
      case "item":
        return this.renderItemSchema(
          schema,
          modelSource,
          baseFieldPath,
          Layout
        );
      case "group":
        return this.renderGroupSchema(
          schema,
          modelSource,
          baseFieldPath,
          Layout
        );
      case "list":
        return this.renderListSchema(
          schema,
          modelSource,
          baseFieldPath,
          baseModelPath,
          Layout
        );
      default:
        return this.renderItemSchema(
          schema,
          modelSource,
          baseFieldPath,
          Layout
        );
    }
  }

  render() {
    return defineComponent({
      setup: () => {
        const formProps = useFormProps(this.runtime);
        return () => (
          <this.meta.Form ref={this.formRef} {...formProps}>
            {{
              ...this.runtime._options.formSlots,
              default: () => (
                <div style={useBaseStyle(this.runtime._options.layoutGap)}>
                  {this.runtime._schema.parsedSchemas.value.map((schema) =>
                    this.renderParsedSchema.bind(this)(schema)
                  )}
                </div>
              ),
            }}
          </this.meta.Form>
        );
      },
    });
  }
}
