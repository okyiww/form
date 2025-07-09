import { createApp } from "vue";
import App from "./App";
import { initForm } from "@okyiww/form";
import { createPinia } from "pinia";
import ArcoVue from "@arco-design/web-vue";

const app = createApp(App);
const pinia = createPinia();

app
  .use(ArcoVue)
  .use(initForm, {
    loader: () => import("@/configs/form-setup"),
  })
  .use(pinia)
  .mount("#app");
