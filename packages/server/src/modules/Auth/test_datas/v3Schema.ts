/**
 * v3Schema 应该致力于实现 And Or Not 的复合 CONDITION
 */

export function v3Schema() {
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
                      field: "name.test",
                      as: {
                        $dispatch: "GET",
                        target: "/dict/genderOptions/test",
                        path: "data",
                        then: [
                          {
                            $dispatch: "SET_MODEL",
                            field: "remark",
                            as: "remark updated $model.name.test",
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
      label: "备注ee3 $shared.test",
      show: {
        $dispatch: "CONDITION",
        op: "eq",
        left: "$model.name",
        right: "$model.gender",
        then: true,
      },
    },
    {
      component: "Input",
      field: "remark3",
      label: "备注ee4 $shared.test",
      show: {
        $dispatch: "CONDITION",
        and: [
          {
            op: "eq",
            left: "1",
            right: "1",
          },
          {
            op: "eq",
            left: "$model.name.test",
            right: "张三",
          },
        ],
        then: {
          $dispatch: "SET_SHARED",
          field: "test",
          as: "$model.name.test $model.gender $model.test 被选中",
        },
      },
    },
  ];
}
