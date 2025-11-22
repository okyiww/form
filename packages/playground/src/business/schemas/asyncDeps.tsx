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
      onChange: raw((utils, value) => {
        console.log("utils", utils.model.name);
        console.log("value", value);
      }),
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
  {
    label: "备注",
    field: "remark",
    component: Input,
    componentProps: {
      modelValue: ({ model }) => {
        return `${model.gender} + ${model.name}`;
      },
    },
  },
  {
    label: "备注2",
    field: "remark2",
    component: Input,
    componentProps: {
      modelValue:
        () =>
        () =>
        () =>
        () =>
        () =>
        () =>
        () =>
        () =>
        ({ model }) =>
          "hello world" + model.name,
    },
    defaultValue: () => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(() => {
            return ({ model }) => {
              return "备注3" + model.name;
            };
          });
        }, 1000);
      });
    },
  },
]);
