export function getRegistSchemas() {
  return [
    {
      component: "Input",
      field: "name",
      label: "姓名",
      required: true,
    },
    {
      type: "group",
      label: "个人信息",
      children: [
        {
          component: "Select",
          field: "gender",
          label: "性别",
          required: true,
          componentProps: {
            options: {
              __sp_type__: "GET",
              target: "/dict/genderOptions",
              path: "data",
            },
          },
          // componentProps: {
          //   options: [
          //     { label: "男", value: "male" },
          //     { label: "女", value: "female" },
          //   ],
          // },
        },
      ],
    },
  ];
}
