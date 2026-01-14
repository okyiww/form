import { Input, InputNumber, RadioGroup, Select } from "@arco-design/web-vue";
import { defineFormSchema, raw } from "@okyiww/form";
import { ref } from "vue";

export default defineFormSchema([
  {
    type: "list",
    field: "namXX__e",
    children: [
      {
        label: "姓名",
        field: "nameOO",
        required: true,
        component: Input,
      },
    ],
  },
  {
    label: "年龄",
    field: "name",
    required: true,
    component: Input,
    componentProps: {
      options: ({ model }) =>
        model.name === "A"
          ? [
              { label: "1", value: 1 },
              { label: "2", value: 2 },
              { label: "3", value: 3 },
            ]
          : [
              { label: "4", value: 4 },
              { label: "5", value: 5 },
              { label: "6", value: 6 },
            ],
    },
  },
  {
    label: ({ model }) => model.name + "hello",
    field: "gender2",
    component: Select,
    componentProps: {
      options: [
        { label: "男", value: "male" },
        { label: "女", value: "female" },
      ],
    },
  },
]);
