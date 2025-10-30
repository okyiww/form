import BasicLayout from "@/layouts/BasicLayout";
import type { RouteRecordRaw } from "vue-router";

const Home = {
  path: "/",
  name: "Home",
  meta: {
    hide: true,
  },
  redirect: {
    name: "BasicDemo",
  },
} satisfies RouteRecordRaw;

export default Home;
