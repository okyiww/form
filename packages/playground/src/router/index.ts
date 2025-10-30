import BasicLayout from "@/layouts/BasicLayout";
import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory("/form-playground"),
  routes: [
    {
      path: "/",
      name: "Home",
      redirect: {
        name: "BasicDemo",
      },
      component: BasicLayout,
      children: [
        {
          path: "/basic-demo",
          name: "BasicDemo",
          component: () => import("@/views/BasicDemo"),
        },
      ],
    },
  ],
});

export default router;
