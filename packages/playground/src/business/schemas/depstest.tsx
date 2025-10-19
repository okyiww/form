import { Input, InputNumber, RadioGroup, Select } from "@arco-design/web-vue";
import { defineFormSchema, raw } from "@okyiww/form";

export default defineFormSchema([
  {
    label: "姓名",
    field: "name",
    component: Input,
    componentProps: {
      onInput: raw((utils, value) => {
        console.log("onInput", value);
        utils.share({
          nameBySharing: value,
        });
      }),
    },
  },
  {
    label: "性别",
    field: "gender",
    component: RadioGroup,
    // componentProps: () => {
    //   return {
    //     options: () => {
    //       return new Promise((resolve) => {
    //         console.log("re triggered ");
    //         setTimeout(() => {
    //           resolve([
    //             { label: "男", value: "male" },
    //             { label: "女", value: "female" },
    //           ]);
    //         }, 1000);
    //       });
    //     },
    //   };
    // },
    componentProps: {
      options: ({ model }) => {
        return new Promise((resolve) => {
          console.log("re triggered ");
          setTimeout(() => {
            resolve([
              { label: "男", value: "male" },
              { label: "女", value: "female" },
            ]);
          }, 1000);
        });
      },
    },
  },
  {
    label: "欢迎",
    field: "welcome",
    component: ({ model }) => (model.name?.length > 10 ? Input : Select),
  },

  {
    label: "sharedTry",
    field: "sharedTry",
    component: ({ shared }) => <div>{shared.nameBySharing}</div>,
  },
]);
