/**
 * v3Schema 应该致力于实现 And Or Not 的复合 CONDITION
 */

export function v9Schema() {
  return [
    {
      component: "Input",
      field: "name.test",
      label: "姓名",
      required: true,
      componentProps: {},
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
              $dispatch: "GET",
              target: "/dict/getOptions2",
              path: "data",
              transform: {
                method: "map",
                relation: {
                  text: "label",
                  val: "value",
                },
              },
            },
          },
        },
      ],
    },
  ];
}
