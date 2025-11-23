import BasicLayout from "@/layouts/BasicLayout";
import { RouterView, type RouteRecordRaw } from "vue-router";

const Setting = {
  path: "/setting",
  name: "Setting",
  meta: {
    locale: "设置",
  },
  redirect: {
    name: "UserList",
  },
  component: BasicLayout,
  children: [
    {
      path: "system",
      name: "System",
      component: RouterView,
      meta: {
        locale: "系统管理",
        icon: "mingcute:settings-6-line",
      },
      children: [
        {
          path: "user-list",
          name: "UserList",
          meta: {
            locale: "用户列表",
          },
          component: () => import("@/views/Setting/UserList"),
        },
      ],
    },
  ],
} satisfies RouteRecordRaw;

export default Setting;
