import { Input, InputNumber, RadioGroup, Select } from "@arco-design/web-vue";
import { defineFormSchema, raw } from "@okyiww/form";
import { ref } from "vue";

export default defineFormSchema([
  {
    label: "姓名",
    field: "name",
    component: Input,
    lookup: true,
  },
  {
    label: "职业",
    field: "job",
    component: Input,
  },
  {
    label: "性别",
    field: "gender",
    component: Select,
    componentProps: {
      options: [
        { label: "男", value: "male" },
        { label: "女", value: "female" },
      ],
      multiple: true,
    },
    lookup: raw({
      source: "options",
      match: "value",
      format: (matchResult) => {
        console.log("matchResult", matchResult);
        return matchResult.map((item) => item.label).join(",");
      },
    }),
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
      multiple: true,
    },
    lookup: raw({
      source: "options",
      match: "value",
      format: (matchResult) => {
        return matchResult.map((item) => item.label).join(",");
      },
    }),
  },
]);
