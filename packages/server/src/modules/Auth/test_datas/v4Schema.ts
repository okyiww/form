/**
 * v4 主要用于验证复杂 condition 的组合使用
 */

export function v4Schema() {
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
                  op: "eq",
                  left: "1",
                  right: "2",
                  then: {
                    $dispatch: "SET_MODEL",
                    field: "name",
                    as: {
                      $dispatch: "GET",
                      target: "/dict/gender2Options/test",
                      path: "data",
                      then: [
                        {
                          $dispatch: "ALERT",
                          message: "query ok",
                        },
                      ],
                      catch: [
                        {
                          $dispatch: "ALERT",
                          message: "query error",
                        },
                      ],
                    },
                  },
                  else: [
                    {
                      $dispatch: "CONDITION",
                      and: [
                        {
                          op: "eq",
                          left: "hello $model.name",
                          right: "hello world",
                        },
                        {
                          op: "eq",
                          left: "2",
                          right: "2",
                        },
                      ],
                      then: {
                        $dispatch: "SET_MODEL",
                        field: "remark2",
                        as: "$model.gender",
                      },
                    },
                  ],
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
      label: "备注",
      defaultValue: "hello world",
    },
    {
      component: "Input",
      field: "remark2",
      label: "备注2",
      defaultValue: "hello world",
    },
  ];
}
