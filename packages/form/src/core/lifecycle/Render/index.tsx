import { FormContext } from "@/core/context";
import { useBaseStyle } from "@/core/lifecycle/hooks/useBaseStyle";
import { useFormItemProps } from "@/core/lifecycle/hooks/useFormItemProps";
import { useFormProps } from "@/core/lifecycle/hooks/useFormProps";
import { useLayout } from "@/core/lifecycle/hooks/useLayout";
import { useLayoutStyle } from "@/core/lifecycle/hooks/useLayoutStyle";
import { ParsedSchema } from "@/core/lifecycle/Schema/types";
import Runtime from "@/core/runtime";
import { cloneDeep, get, isBoolean, set } from "lodash";
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
    return (
      show && (
        <Layout style={useLayoutStyle(schema, this.runtime._options.layoutGap)}>
          <this.meta.FormItem
            {...formItemProps}
            label={schema.label}
            rules={[
              {
                required: true,
                message: `${schema.label}不能为空`, // TODO: 多语种
              },
            ]}
          >
            <Component
              ref={componentRef}
              modelValue={get(modelSource, schema.field)}
              onUpdate:modelValue={(value: any) => {
                set(modelSource, schema.field, value);
              }}
              {...schema.componentProps}
            ></Component>
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
                    return schema.children.map((childSchema: any) => {
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
                    });
                  },
                  delete: ({ render }: any) => {
                    const Delete = render();
                    return (
                      listModel.length > 1 && (
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
            <div style={useBaseStyle(this.runtime._options.layoutGap)}>
              {this.runtime._schema.parsedSchemas.value.map((schema) =>
                this.renderParsedSchema.bind(this)(schema)
              )}
            </div>
          </this.meta.Form>
        );
      },
    });
  }
}
