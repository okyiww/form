import { defineComponent } from "vue";
import { version, useForm, defineFormSchema, raw } from "@okyiww/form";
import { Input, Select } from "@arco-design/web-vue";

export default defineComponent({
  setup() {
    console.log("the okyiww form version is", version);

    const [Form] = useForm({
      schemas: defineFormSchema([
        {
          label: "姓名",
          field: "name",
          defaultValue: () => "Evan Huang",
          component: Input,
        },
        {
          type: "list",
          field: "firstlevel",
          children: [
            {
              field: "seconlevel",
              type: "list",
              children: [
                {
                  component: Input,
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
          ],
        },
        {
          label: "近期活动",
          field: () =>
            new Promise((resolve) => {
              setTimeout(() => {
                resolve("recent-activities");
              }, 3000);
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
              }, 5000);
            }),
        },
        {
          label: "爱好",
          type: () =>
            new Promise((resolve) =>
              setTimeout(() => {
                resolve("list");
              }, 2000)
            ),
          field: () =>
            new Promise((resolve) => {
              setTimeout(() => {
                resolve("hobbies");
              }, 4000);
            }),
          defaultValue: () =>
            new Promise((resolve) => {
              setTimeout(() => {
                resolve([
                  { content: "hyper", else: "ok" },
                  { content: "2s", else: "ok2s" },
                ]);
              }, 2000);
            }),
          children: [
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
          label: "清洁的初始化测试",
          type: "list",
          field: "clean-init-test",
          defaultValue: () =>
            new Promise((resolve) => {
              setTimeout(() => {
                resolve([{ content: "clean-init-test-child" }]);
              }, 2000);
            }),
          children: [
            {
              label: "清洁的初始化测试-child",
              field: "content",
              component: () => <Input />,
              defaultValue: () =>
                new Promise((resolve) => {
                  setTimeout(() => {
                    resolve("clean-init-test-child, in okyiww form");
                  }, 3000);
                }),
            },
          ],
        },
      ]),
    });

    return () => (
      <div>
        <div>the okyiww form version is {version}</div>
        <Form />
      </div>
    );
  },
});
