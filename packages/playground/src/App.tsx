import { defineComponent } from "vue";
import { version, useForm, defineFormSchema, raw } from "@okyiww/form";
import { Input } from "@arco-design/web-vue";

export default defineComponent({
  setup() {
    console.log("the okyiww form version is", version);

    const [Form] = useForm({
      schemas: defineFormSchema([
        {
          label: "姓名",
          field: "name",
          component: Input,
        },
        {
          label: "基本情况",
          type: "group",
          children: [
            {
              label: "年龄",
              field: "age",
              component: () => <Input />,
              componentProps: {
                hello: "world",
              },
            },
          ],
        },
        {
          label: "爱好",
          type: "list",
          field: "hobbies",
          children: [
            {
              label: () => "爱好内容",
              field: () => "content",
              component: () => <Input />,
              componentProps: {
                wordLength: raw((value: string) => value.length),
              },
              native: {
                mockdata: () => "for testing",
              },
            },
          ],
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
