import { defineComponent, onBeforeMount, onMounted, ref, watch } from "vue";
import { version, useForm } from "@okyiww/form";
import { Button } from "@arco-design/web-vue";
import styles from "./index.module.scss";
import PageContent from "@/components/PageContent";

export default defineComponent({
  setup() {
    console.log("the okyiww form version is", version);

    function getSchemas() {
      return import("@/business/schemas/asyncDeps").then((res) => res.default);
    }

    const [Form, { submit, schemas, share, isReady, getFormRef }] = useForm({
      schemas: getSchemas,
      formProps: {
        layout: "vertical",
      },
    });

    function handleSubmit() {
      submit().then((res: any) => {
        console.log(res);
      });
    }

    function fetchGenderOptions() {
      setTimeout(() => {
        share({
          genderOptions: [
            { label: "男", value: "male" },
            { label: "女", value: "female" },
          ],
        });
      }, 2000);
    }

    onBeforeMount(() => {
      fetchGenderOptions();
    });

    const formRef = getFormRef();
    isReady(() => {
      formRef.value?.validate((errors: any) => {
        console.log("errors", errors);
      });
    });

    return () => (
      <PageContent title="基础示例">
        {{
          default: () => (
            <div class={styles.app}>
              <div>the okyiww form version is {version}</div>
              <Form />
            </div>
          ),
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
