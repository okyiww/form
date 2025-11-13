import { defineComponent } from "vue";
import styles from "./index.module.scss";
import PageContent from "@/components/PageContent";
import { useForm } from "@okyiww/form";
import { getRegistSchemas } from "@/business/regist";
import axios from "axios";
import { get } from "lodash";

export default defineComponent({
  props: {},
  setup(props) {
    const [Form] = useForm({
      ssr: {
        renderComponent(componentName: string) {
          return import(`@arco-design/web-vue`).then((res) => {
            return res[componentName];
          });
        },
        GET: ({ target, path }) => {
          return axios.get(target).then((res) => {
            return get(res, path);
          });
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
