import { createApp } from "vue";
import App from "./App";
import { initForm } from "@okyiww/form";
import { createPinia } from "pinia";
import ArcoVue from "@arco-design/web-vue";
import "@arco-design/web-vue/dist/arco.css";
import router from "@/router";
import "@/utils/interceptor";
import "./global.scss";
import { applyGuards } from "@/router/guards";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";

const app = createApp(App);
const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

app
  .use(ArcoVue)
  .use(initForm, {
    loader: () => import("@/configs/form-setup"),
    env: "web",
  })
  .use(pinia)
  .use(router)
  .mount("#app");

applyGuards(router);
