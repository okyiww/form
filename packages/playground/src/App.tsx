import { defineComponent } from "vue";
import { version, useForm, defineFormSchema } from "@okyiww/form";

export default defineComponent({
  setup() {
    console.log("the okyiww form version is", version);

    const [form] = useForm({
      schemas: defineFormSchema([
        {
          label: "测试",
          field: "test",
          component: "input",
        },
      ]),
    });
    console.log("form", form);

    return () => <div>the okyiww form version is {version}</div>;
  },
});
