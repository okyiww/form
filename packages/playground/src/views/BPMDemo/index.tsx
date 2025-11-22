import { defineComponent } from "vue";
import styles from "./index.module.scss";
import PageContent from "@/components/PageContent";
import { useForm } from "@okyiww/form";
import { getRegistSchemas } from "@/business/regist";
import axios from "axios";
import { get } from "lodash";
import Counter from "@/components/Counter";

/**
 * TODO:
 * 按照渐进式的设想，该页面最终应该沉淀为一个组件，组件应该支持除了 Form 以外的其他
 * 包括但不限于注入、提交等基本能力在内的逻辑，且组件应该具备可迭代的特性
 */

export default defineComponent({
  props: {},
  setup(props) {
    const [Form] = useForm({
      ssr: {
        renderComponent(componentName: string) {
          // TODO: 自定义组件也应该和这个地方一起注入以供选择
          return import(`@arco-design/web-vue`).then((res) => {
            return { ...res, Counter }[componentName];
          });
        },
        actions: {
          GET: ({ target, path, params }) => {
            return axios.get(target, { params });
          },
          POST: ({ target, path, data }) => {
            return axios.post(target, data);
          },
        },
      },
      schemas: () => getRegistSchemas().then((res) => res.data),
    });
    return () => (
      <PageContent title="BPM 示例">
        <Form />
      </PageContent>
    );
  },
});
