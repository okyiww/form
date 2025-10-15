import { Input, Select } from "@arco-design/web-vue";
import { defineFormSchema, raw } from "@okyiww/form";

export default defineFormSchema([
  {
    label: "姓名",
    field: "name",
    component: Input,
  },
  {
    label: "爱好",
    type: "list",
    field: "hobbies",
    children: [
      {
        // @ts-expect-error
        label: raw((utils, index) => {
          return "爱好类型" + index;
        }),
        field: "hobbyType",
        component: Select,
        componentProps: {
          options: [
            {
              label: "运动",
              value: "sport",
            },
            {
              label: "音乐",
              value: "music",
            },
          ],
        },
      },
    ],
  },
]);
