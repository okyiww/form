import { Input, Select } from "@arco-design/web-vue";
import { defineFormSchema, once, raw } from "@okyiww/form";

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
        label: raw((utils, index) => {
          return "爱好类型" + index + utils.model.name;
        }),
        field: "hobbyType",
        component: Select,
        componentProps: {
          options: once(
            () =>
              new Promise((resolve) => {
                setTimeout(() => {
                  console.log("fetchedn");
                  resolve([
                    {
                      label: "运动",
                      value: "sport",
                    },
                  ]);
                }, 1000);
              })
          ),
        },
      },
    ],
  },
]);
