import { defineComponent, onBeforeMount } from "vue";
import { version, useForm } from "@okyiww/form";
import { Button } from "@arco-design/web-vue";
import styles from "./App.module.scss";

export default defineComponent({
  setup() {
    console.log("the okyiww form version is", version);

    function getSchemas() {
      return import("@/business/schemas/gridTest").then((res) => res.default);
    }

    const [Form, { submit, share }] = useForm({
      schemas: getSchemas,
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

    return () => (
      <div class={styles.app}>
        <div>the okyiww form version is {version}</div>
        <Form />
        <Button type="primary" onClick={handleSubmit}>
          提交
        </Button>
      </div>
    );
  },
});
