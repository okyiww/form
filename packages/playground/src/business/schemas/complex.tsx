import { Input, Select } from "@arco-design/web-vue";
import { defineFormSchema, raw } from "@okyiww/form";

export default defineFormSchema([
  {
    label: "姓名",
    field: "nameold",
    component: Input,
    defaultValue: () => "Evan Huang",
  },
  {
    label: "年龄",
    field: "age",
    component: Input,
    defaultValue: () => "231223801928",
    componentProps: {
      type: ({ model }) => {
        return model.name?.length > 10 ? "text" : "password";
      },
    },
  },
  {
    label: ({ share, model }) => {
      share({
        name: model.nameold,
      });
      return "姓名";
    },
    field: "name",
    defaultValue: () => "Evan Huang",
    component: ({ model }) => (model.nameold?.length > 10 ? Input : Select),
  },
  {
    label: "姓名2",
    field: "name2",
    component: Input,
    span: ({ model }) => (model.name.length > 10 ? 12 : 24),
    componentProps: {
      modelValue: ({ shared }) => {
        return shared.name;
      },
    },
  },
  {
    type: "list",
    field: "firstlevel",
    show: ({ model }) => model.name.length > 10,
    span: ({ model }) => (model.name.length > 10 ? 12 : 24),
    children: [
      {
        field: "seconlevel",
        type: "list",
        children: [
          {
            component: Input,
            label: raw((_, index) => "姓名2" + index),
            field: "secondlevel-value",
          },
          {
            type: "list",
            field: () =>
              new Promise((resolve) => {
                setTimeout(() => {
                  resolve("thirdlevel");
                }, 200);
              }),
            defaultValue: () =>
              new Promise((resolve) => {
                setTimeout(() => {
                  resolve([{ hello: "world" }]);
                }, 200);
              }),
            children: [
              {
                component: Input,
                field: "thirdlevel-value",
                defaultValue: () =>
                  new Promise((resolve) => {
                    setTimeout(() => {
                      resolve("Evan");
                    }, 300);
                  }),
              },
              {
                type: "list",
                field: "fourthlevel",
                children: [
                  {
                    component: Input,
                    field: "fourthlevel-value",
                    defaultValue: () =>
                      new Promise((resolve) => {
                        setTimeout(() => {
                          resolve("Evan2");
                        }, 500);
                      }),
                  },
                  {
                    field: "hi",
                    component: Input,
                    defaultValue: () =>
                      new Promise((resolve) => {
                        setTimeout(() => {
                          resolve("Evan4");
                        }, 600);
                      }),
                  },
                  {
                    type: "list",
                    field: "fifthlevel",
                    children: [
                      {
                        component: Input,
                        field: "fifthlevel-value",
                        defaultValue: () =>
                          new Promise((resolve) => {
                            setTimeout(() => {
                              resolve("Evan35");
                            }, 400);
                          }),
                      },
                      {
                        type: "list",
                        field: "sixthlevel",
                        children: [
                          {
                            component: Input,
                            field: "sixthlevel-value",
                            defaultValue: () =>
                              new Promise((resolve) => {
                                setTimeout(() => {
                                  resolve("Evan36");
                                }, 500);
                              }),
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    label: "基本情况",
    type: () =>
      new Promise((resolve) => {
        setTimeout(() => {
          resolve("group");
        }, 1000);
      }),
    children: [
      {
        label: "年龄",
        field: "age",
        component: () => <Input />,
        componentProps: {
          hello: "world",
        },
        defaultValue: () => "23",
      },
      {
        label: "年龄group",
        type: "group",
        children: [
          {
            label: "年龄inner",
            field: "age",
            component: () => <Input />,
          },
        ],
      },
      {
        label: "年龄list",
        field: "agelist",
        type: "list",
        children: [
          {
            label: "年龄innerlist",
            field: "ageinside",
            component: () => <Input />,
            defaultValue: () => "235979",
          },
        ],
      },
    ],
  },
  {
    label: "近期活动",
    field: () =>
      new Promise((resolve) => {
        setTimeout(() => {
          resolve("recent-activities");
        }, 0);
      }),
    component: () => <Select />,
    componentProps: {
      options: [
        {
          label: "for the testing",
          value: "buy xxx",
        },
        {
          label: "for the testing2",
          value: "buy xxx2",
        },
      ],
    },
    defaultValue: () =>
      new Promise((resolve) => {
        setTimeout(() => {
          resolve("buy xxx");
        }, 0);
      }),
  },
  {
    label: "爱好",
    type: "list",
    field: "hobbies",

    children: [
      {
        label: "爱好测试",
        field: "testing",
        component: Input,
      },
      {
        label: () => "爱好内容",
        type: () =>
          new Promise((resolve) =>
            setTimeout(() => {
              resolve("item");
            }, 3000)
          ),
        defaultValue: () =>
          new Promise((resolve) => {
            setTimeout(() => {
              resolve("football");
            }, 1000);
          }),
        field: () => "content",
        component: () => <Select />,
        componentProps: {
          options: [
            {
              label: "篮球",
              value: "basketball",
            },
            {
              label: "足球",
              value: "football",
            },
          ],
        },
        native: {
          mockdata: () => "for testing",
        },
        deepercase: {
          names: [
            {
              value: () =>
                new Promise((resolve) => {
                  setTimeout(() => {
                    resolve("Evan Huang");
                  }, 1000);
                }),
              age: {
                value: () => "23",
                rawValue: raw(() => "23"),
                promisedValue: () =>
                  new Promise((resolve) => {
                    setTimeout(() => {
                      resolve("23");
                    }, 1000);
                  }),
              },
            },
          ],
        },
      },
    ],
  },
  {
    label: "禁用",
    component: Input,
    field: "disabled",
  },
  {
    label: "禁用2",
    component: () => <Input />,
    field: "disabled2",
    componentProps: {
      disabled: ({ model }) => {
        return !!model.disabled;
      },
    },
  },
  {
    label: "测试",
    type: "list",
    field: "clean-parent-test",
    defaultValue: () =>
      new Promise((resolve) => {
        setTimeout(() => {
          resolve([
            {
              content: "clean-init-test-child",
              "clean-child-test": "clean-init-test-child, in okyiww form",
            },
          ]);
        }, 1000);
      }),
    children: [
      {
        label: "测试-child",
        field: "clean-child-test",
        component: Input,
        // defaultValue: "halo",
        defaultValue: () =>
          new Promise((resolve) => {
            setTimeout(() => {
              resolve("clean-init-test-123child, in okyiww form");
            }, 2000);
          }),
        componentProps: {
          disabled: ({ model }) => {
            return !!model.disabled;
          },
          type: ({ model }) => (!!model.disabled ? "password" : "text"),
        },
      },
      {
        label: "测试-child2",
        field: "content",
        component: () => <Input />,
        defaultValue: () =>
          new Promise((resolve) => {
            setTimeout(() => {
              resolve("最后一个触发应该");
            }, 3000);
          }),
      },
      {
        label: "测试-child3",
        field: "content3",
        component: () => <Input />,
        defaultValue: "应该有？",
      },
    ],
  },
]);
