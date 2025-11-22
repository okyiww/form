/**
 * v3Schema 应该致力于实现 And Or Not 的复合 CONDITION
 */

export function v3Schema() {
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
                      left: "$model.gender",
                      right: "$model.name",
                    },
                    {
                      op: "in",
                      left: "1",
                      right: ["1", "2"],
                    },
                  ],
                  then: [
                    {
                      $dispatch: "SET_MODEL",
                      field: "name",
                      as: {
                        $dispatch: "GET",
                        target: "/dict/genderOptions/test",
                        path: "data",
                        then: [
                          {
                            $dispatch: "SET_MODEL",
                            field: "remark",
                            as: "remark updated $model.name",
                          },
                          {
                            $dispatch: "SET_MODEL",
                            field: "remark2",
                            as: "remark updated $model.gender",
                          },
                        ],
                      },
                    },
                  ],
                  else: {
                    $dispatch: "SET_SHARED",
                    field: "test",
                    as: "123",
                  },
                },
              ],
            },
          },
        },
      ],
    },
    {
      component: "Input",
      field: "remark",
      label: "备注123",
      show: {
        $dispatch: "CONDITION",
        op: "eq",
        left: "$model.name",
        right: "$model.gender",
        then: true,
      },
      defaultValue: "hello world",
    },
    {
      component: "Input",
      field: "remark2",
      label: "备注ee3",
      show: {
        $dispatch: "CONDITION",
        op: "eq",
        left: "$model.name",
        right: "$model.gender",
        then: true,
      },
    },
  ];
}
