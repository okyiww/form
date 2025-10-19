import Counter from "@/components/Counter";
import { Input, InputNumber, RadioGroup, Select } from "@arco-design/web-vue";
import { defineFormSchema, raw } from "@okyiww/form";

export default defineFormSchema([
  {
    label: "姓名",
    field: "name",
    component: Input,
    xx: () =>
      new Promise((resolve) => {
        setTimeout(() => {
          resolve("halo");
        }, 1000);
      }),
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
    show: ({ shared }) => shared.allowDisplay,
  },
  {
    label: "年龄",
    field: "age",
    component: InputNumber,
    defaultValue: 18,
    show: ({ model }) => model.enablePassword,
  },
  {
    label: "性别",
    field: "gender",
    component: RadioGroup,
    componentProps: {
      options: ({ shared, model }) => {
        return shared.genderOptions;
      },
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
      onChange: raw((utils, value) => {
        utils.share({
          allowDisplay: value === "basketball",
        });
      }),
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
        required: true,
        defaultValue: "phone",
      },
      {
        label: "联系方式",
        field: "contact",
        component: Input,
        componentProps: {
          onInput: raw((utils, value) => {
            utils.refs.get("counter").value.increment();
            utils.share({
              contact: value,
            });
          }),
        },
      },
    ],
  },
  {
    label: "show contact",
    field: "showContact",
    component: ({ shared }) => <div>{shared.contact}</div>,
  },
  {
    label: "计数器",
    field: "counter",
    component: Counter,
  },
]);
