import { Input, InputNumber, RadioGroup, Select } from "@arco-design/web-vue";
import { defineFormSchema, raw } from "@okyiww/form";

export default defineFormSchema([
  {
    label: "姓名",
    field: "name",
    component: Input,
  },
  {
    type: "group",
    span: 12,
    children: [
      {
        label: "年龄",
        field: "age",
        component: InputNumber,
      },
    ],
  },
  {
    type: "group",
    span: 12,
    children: [
      {
        label: "性别",
        field: "gender",
        component: RadioGroup,
        componentProps: {
          options: [
            { label: "男", value: "male" },
            { label: "女", value: "female" },
          ],
        },
      },
    ],
  },
]);
