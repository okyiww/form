import { Input, InputNumber, RadioGroup, Select } from "@arco-design/web-vue";
import { defineFormSchema, raw } from "@okyiww/form";

export default defineFormSchema([
  {
    label: "姓名",
    field: "name",
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
    label: "性别",
    field: "gender",
    component: Select,
    componentProps: () => {
      return {
        options: ({ model }) => {
          return new Promise((resolve) => {
            setTimeout(() => {
              resolve([
                { label: "男" + model.select, value: "male" },
                { label: "女", value: "female" },
              ]);
            }, 1000);
          });
        },
      };
    },
  },
]);
