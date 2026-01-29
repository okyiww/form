import {
  Cascader,
  Input,
  RangePicker,
  Select,
  TreeSelect,
} from "@arco-design/web-vue";
import { defineFormSchema, raw } from "@okyiww/form";

export default defineFormSchema([
  {
    label: "姓名",
    field: "name",
    component: Input,
    lookup: true,
  },
  {
    label: "职业",
    field: "job",
    component: Input,
  },
  {
    label: "性别",
    field: "gender",
    component: Select,
    componentProps: {
      options: () => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve([
              { label: "男", value: "male" },
              { label: "女", value: "female" },
            ]);
          }, 1000);
        });
      },
      multiple: true,
    },
    lookup: raw({
      source: "options",
      match: "value",
      format: (matchResult) => {
        return matchResult.map((item) => item.label).join(",");
      },
    }),
  },
  {
    label: ({ model }) => model.name + "hello",
    field: "gender2",
    component: Select,
    componentProps: {
      options: [
        { label: "男", value: "male" },
        { label: "女", value: "female" },
      ],
      multiple: true,
    },
    lookup: raw({
      source: "options",
      match: "value",
      format: (matchResult) => {
        return matchResult.map((item) => item.label).join(",");
      },
    }),
  },
  {
    label: ({ model }) => model.name + "hello",
    field: "test",
    component: Cascader,
    componentProps: {
      multiple: true,
      pathMode: true,
      options: [
        {
          value: "beijing",
          label: "北京",
          children: [
            {
              value: "chaoyang",
              label: "朝阳",
              children: [
                {
                  value: "datunli",
                  label: "大屯里",
                },
              ],
            },
            {
              value: "haidian",
              label: "Haidian",
            },
            {
              value: "dongcheng",
              label: "Dongcheng",
            },
            {
              value: "xicheng",
              label: "Xicheng",
              children: [
                {
                  value: "jinrongjie",
                  label: "Jinrongjie",
                },
                {
                  value: "tianqiao",
                  label: "Tianqiao",
                },
              ],
            },
          ],
        },
        {
          value: "shanghai",
          label: "Shanghai",
          children: [
            {
              value: "huangpu",
              label: "Huangpu",
            },
          ],
        },
      ],
    },
    lookup: raw({
      source: "options",
      match: "value",
      format: (matchResult) => {
        console.log("match", matchResult);
        return matchResult
          .map((item) => item.map((item) => item.label).join(","))
          .join("; ");
      },
    }),
  },
  {
    label: "测试Tree",
    field: "testTree",
    component: TreeSelect,
    componentProps: {
      multiple: true,
      data: [
        {
          key: "node1",
          title: "Trunk",
          disabled: true,
          children: [
            {
              key: "node2",
              title: "Leaf",
            },
          ],
        },
        {
          key: "node3",
          title: "Trunk2",
          children: [
            {
              key: "node4",
              title: "Leaf",
            },
            {
              key: "node5",
              title: "Leaf",
            },
          ],
        },
      ],
    },
    lookup: raw({
      source: "data",
      match: "key",
      childrenKey: "children",
      format: (matchResult) => {
        return matchResult.map((item) => item.title).join(",");
      },
    }),
  },
  {
    label: "测试Date",
    field: "date123",
    component: RangePicker,
    lookup: raw(() => {
      return {
        format: (matchResult) => {
          console.log("matchResult", matchResult);
          return matchResult.join(" - ");
        },
      };
    }),
    placeholder: ["请选择1日期", "请选择日期"],
  },
]);
