import { Input, Select } from "@arco-design/web-vue";
import { defineFormSchema, raw } from "@okyiww/form";

export default defineFormSchema([
  {
    label: "测试",
    type: "list",
    field: "clean-parent-test",
    children: [
      {
        label: "测试-child2",
        field: "content",
        component: () => <Input />,
        defaultValue: () =>
          new Promise((resolve) => {
            setTimeout(() => {
              console.log("最后一个");
              resolve("最后一个触发应该");
            }, 100);
          }),
      },
    ],
  },
]);
