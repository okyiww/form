import { Input, InputNumber, RadioGroup, Select } from "@arco-design/web-vue";
import { defineFormSchema, raw } from "@okyiww/form";

export default defineFormSchema([
  {
    label: "姓名",
    field: "test.name",
    component: Input,
  },
  {
    label: "选择",
    field: "select",
    component: () => <Select />,
    componentProps: {
      options: [
        {
          label: "选择1",
          value: "select",
        },
        {
          label: "选择2",
          value: "select2",
        },
      ],
    },
  },
  {
    label: "备注",
    field: "remark",
    component: Input,
  },
]);
