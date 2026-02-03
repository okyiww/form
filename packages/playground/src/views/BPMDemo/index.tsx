import { defineComponent } from "vue";
import styles from "./index.module.scss";
import PageContent from "@/components/PageContent";
import { useForm } from "@okyiww/form";
import { getRegistSchemas } from "@/business/regist";
import axios from "axios";
import { get } from "lodash";
import Counter from "@/components/Counter";
import { Button, Input } from "@arco-design/web-vue";

/**
 * TODO:
 * 按照渐进式的设想，该页面最终应该沉淀为一个组件，组件应该支持除了 Form 以外的其他
 * 包括但不限于注入、提交等基本能力在内的逻辑，且组件应该具备可迭代的特性
 */

export default defineComponent({
  props: {},
  setup(props) {
    const ssr: any = {
      renderComponent(componentName: string) {
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
    };
    const [Form, { submit, updateForm }] = useForm({
      ssr,
      schemas: () => getRegistSchemas().then((res) => res.data),
    });

    function handleSubmit() {
      submit().then((res: any) => {
        console.log(res);
      });
    }

    setTimeout(() => {
      console.log("before updateSchemas");
      updateForm({
        ssr,
        schemas: [
          {
            component: "Input",
            label: "姓名",
            field: "name",
            required: true,
          },
        ],
      });
      console.log("after updateSchemas");
    }, 2000);

    return () => (
      <PageContent title="BPM 示例">
        {{
          default: () => <Form />,
          headerRight: () => (
            <Button type="primary" onClick={handleSubmit}>
              提交
            </Button>
          ),
        }}
      </PageContent>
    );
  },
});
