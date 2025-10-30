import BasicLayout from "@/layouts/BasicLayout";
import { RouterView, type RouteRecordRaw } from "vue-router";

const Demo = {
  path: "/demo",
  name: "Demo",
  meta: {
    hide: true,
  },
  component: BasicLayout,
  children: [
    {
      path: "developer",
      name: "Developer",
      component: RouterView,
      meta: {
        locale: "面向开发人员",
      },
      children: [
        {
          path: "basic-demo",
          name: "BasicDemo",
          meta: {
            locale: "基础示例",
          },
          component: () => import("@/views/BasicDemo"),
        },
        {
          path: "complex-demo",
          name: "ComplexDemo",
          meta: {
            locale: "复杂示例",
          },
          component: () => import("@/views/ComplexDemo"),
        },
      ],
    },
    {
      path: "bpm",
      name: "BPM",
      component: RouterView,
      meta: {
        locale: "面向程序 BPM",
      },
      children: [
        {
          path: "bpm-demo",
          name: "BPMDemo",
          meta: {
            locale: "基础示例",
          },
          component: () => import("@/views/BPMDemo"),
        },
      ],
    },
  ],
} satisfies RouteRecordRaw;

export default Demo;
