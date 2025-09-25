import { defineComponent } from "vue";
import { version, useForm, defineFormSchema, raw } from "@okyiww/form";
import {
  Button,
  Input,
  InputNumber,
  RadioGroup,
  Select,
} from "@arco-design/web-vue";
import styles from "./App.module.scss";

export default defineComponent({
  setup() {
    console.log("the okyiww form version is", version);

    const [Form, { submit }] = useForm({
      schemas: defineFormSchema([
        {
          label: "姓名",
          field: "name",
          component: Input,
        },
        {
          label: "年龄",
          field: "age",
          component: InputNumber,
          defaultValue: 18,
        },
        {
          label: "性别",
          field: "gender",
          component: RadioGroup,
          componentProps: {
            options: [
              { label: "男", value: "male" },
              { label: "女", value: "female" },
            ],
            type: "button",
          },
          defaultValue: "male",
        },
        {
          label: "爱好",
          field: "hobbies",
          component: Select,
          componentProps: {
            options: [
              { label: "篮球", value: "basketball" },
              { label: "足球", value: "football" },
            ],
          },
        },
        {
          label: "联系方式",
          type: "list",
          field: "contacts",
          children: [
            {
              label: "联系类型",
              field: "contactType",
              component: Select,
              componentProps: {
                options: [
                  { label: "电话", value: "phone" },
                  { label: "邮箱", value: "email" },
                ],
              },
            },
            {
              label: "联系方式",
              field: "contact",
              component: Input,
            },
          ],
        },
      ]),
    });

    function handleSubmit() {
      submit().then((res: any) => {
        console.log(res);
      });
    }

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
