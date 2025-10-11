import { Input, InputNumber, RadioGroup, Select } from "@arco-design/web-vue";
import { defineFormSchema, raw } from "@okyiww/form";

export default defineFormSchema([
  {
    label: "姓名",
    field: "name",
    component: Input,
  },
  {
    label: "启用密码",
    field: "enablePassword",
    component: ({ share, model }) => {
      setTimeout(() => {
        share({
          message: "This is a message from share: " + model.name,
        });
      }, 100);
      return RadioGroup;
    },
    componentProps: {
      options: [
        { label: "是", value: true },
        { label: "否", value: false },
      ],
    },
    defaultValue: true,
  },
  {
    label: "密码",
    field: "password",
    component: Input,
    componentProps: {
      type: ({ model }) => {
        return model.enablePassword ? "password" : "text";
      },
    },
  },
  {
    label: "年龄",
    field: "age",
    component: InputNumber,
    defaultValue: 18,
  },
  {
    label: "性别",
    field: "gender",
    component: RadioGroup,
    componentProps: {
      options: [
        { label: "男", value: "male" },
        { label: "女", value: "female" },
      ],
      type: "button",
    },
    defaultValue: "male",
  },
  {
    label: "爱好",
    field: "hobbies",
    component: ({ shared }) => (shared.genderOptions ? Select : Input),
    componentProps: {
      options: [
        { label: "篮球", value: "basketball" },
        { label: "足球", value: "football" },
      ],
    },
  },
  {
    label: "联系方式",
    type: "list",
    field: "contacts",
    children: [
      {
        label: "联系类型",
        field: "contactType",
        component: Select,
        componentProps: {
          options: [
            { label: "电话", value: "phone" },
            { label: "邮箱", value: "email" },
          ],
        },
        defaultValue: "phone",
      },
      {
        label: "联系方式",
        field: "contact",
        component: Input,
      },
    ],
  },
]);
