export function v5Schema() {
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
                  $dispatch: "REFS",
                  field: "remark",
                  call: "focus",
                },
                {
                  $dispatch: "REFS",
                  field: "counter",
                  call: "increment",
                  args: ["$model.name 1", "$model.gender 2"],
                },
                {
                  $dispatch: "SET_MODEL",
                  field: "remark2",
                  as: {
                    $dispatch: "REFS",
                    field: "counter",
                    get: "theRemark",
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
      label: "备注2$model.name",
    },
  ];
}
