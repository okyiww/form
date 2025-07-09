import { defineComponent } from "vue";
import { version, useForm, defineFormSchema } from "@okyiww/form";
import { Input } from "@arco-design/web-vue";

export default defineComponent({
  setup() {
    console.log("the okyiww form version is", version);

    const [Form] = useForm({
      schemas: defineFormSchema([
        {
          label: "测试",
          field: "test",
          component: Input,
        },
      ]),
    });

    return () => (
      <div>
        <div>the okyiww form version is {version}</div>
        <Form />
      </div>
    );
  },
});
