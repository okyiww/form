/**
 * v3Schema 应该致力于实现 And Or Not 的复合 CONDITION
 */

export function v7Schema() {
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
              target: "/dict/genderOptions",
              path: "data",
              params: {
                customName: "$model.name",
              },
            },
            onChange: {
              $dispatch: "EVENT_HANDLER",
              pipes: [
                {
                  $dispatch: "CONDITION",
                  or: [
                    {
                      op: "eq",
                      left: "$args.0",
                      right: "$model.name.test",
                    },
                  ],
                  then: [
                    {
                      $dispatch: "SET_MODEL",
                      field: "name.test",
                      as: "hi",
                    },
                  ],
                },
              ],
            },
          },
        },
      ],
    },
  ];
}
