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
          field: () =>
            new Promise((resolve) => {
              setTimeout(() => {
                resolve("name");
              }, 2000);
            }),
          component: Input,
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
          defaultValue: () =>
            new Promise((resolve) => {
              setTimeout(() => {
                resolve([
                  {
                    event: "buy xxx",
                  },
                ]);
              }, 5000);
            }),
        },
        {
          label: "爱好",
          type: () =>
            new Promise((resolve) => {
              setTimeout(() => {
                resolve("list");
              }, 2000);
            }),
          field: () =>
            new Promise((resolve) => {
              setTimeout(() => {
                resolve("hobbies");
              }, 4000);
            }),
          defaultValue: () =>
            new Promise((resolve) => {
              setTimeout(() => {
                resolve([{ content: "hyper" }]);
              }, 1000);
            }),
          children: [
            {
              label: () => "爱好内容",
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
