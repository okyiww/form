import { Input, InputNumber, RadioGroup, Select } from "@arco-design/web-vue";
import { defineFormSchema, raw } from "@okyiww/form";

export default defineFormSchema([
  {
    type: "list",
    field: "test",
    children: [
      {
        label: "姓名",
        field: "name2",
        required: true,
        component: Input,
      },
    ],
  },
]);
