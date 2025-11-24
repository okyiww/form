export function v6Schema() {
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
                  $dispatch: "GET",
                  target: "/dict/genderOptions",
                  path: "data",
                  params: {
                    customName: "$model.name",
                  },
                  then: {
                    $dispatch: "POST",
                    target: "/dict/genderOptions",
                    path: "data",
                    data: {
                      customName: "$model.name",
                    },
                    then: [
                      {
                        $dispatch: "CONDITION",
                        op: "in",
                        left: "男",
                        right: [
                          {
                            $dispatch: "GET",
                            target: "/dict/genderOptions",
                            path: "data[0].label",
                          },
                        ],
                        then: {
                          $dispatch: "SET_MODEL",
                          field: "remark",
                          as: "$res.parentRes.[1].label",
                        },
                      },
                    ],
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
      label: "备注",
      defaultValue: "hello world",
    },
    {
      component: "Counter",
      field: "counter",
    },
    {
      component: "Input",
      field: "remark2",
      label: "备注3333",
      defaultValue: "hello world",
      show: {
        $dispatch: "CONDITION",
        or: [
          {
            op: "eq",
            left: "$model.name",
            right: "test",
          },
          {
            op: "eq",
            left: "$model.gender",
            right: "male",
          },
        ],
      },
    },
  ];
}
