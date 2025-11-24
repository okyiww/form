/**
 * v4Schema 应该致力于实现 pipes 的数据传递
 */

export function v2Schema() {
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
                  left: "$model.gender",
                  right: "$model.name",
                  then: {
                    $dispatch: "SET_MODEL",
                    field: "name",
                    as: {
                      $dispatch: "GET",
                      target: "/dict/genderOptions/test",
                      path: "data",
                    },
                  },
                  else: {
                    $dispatch: "SET_MODEL",
                    field: "name",
                    as: "$model.remark",
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
      show: {
        $dispatch: "CONDITION",
        op: "eq",
        left: "$model.name",
        right: "$model.gender",
      },
      defaultValue: "hello world",
    },
    {
      component: "Select",
      field: "currentGender",
      label: "当前性别",
      show: {
        $dispatch: "CONDITION",
        op: "eq",
        left: "$model.name",
        right: "hello world",
      },
    },
    {
      component: "Input",
      field: "currentGender2",
      label: "$shared.test",
      show: {
        $dispatch: "CONDITION",
        op: "eq",
        left: "$model.name",
        right: "hello world",
      },
    },
    // {
    //   component: "Select",
    //   field: "currentGender",
    //   label: "当前性别",
    //   componentProps: {
    //     options: {
    //       $dispatch: "",
    //       $return: "$shared.currentGenderOptions",
    //     },
    //   },
    // },
  ];
}
