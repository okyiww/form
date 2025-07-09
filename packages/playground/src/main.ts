import { createApp } from "vue";
import App from "./App";
import { initForm } from "@okyiww/form";
import { createPinia } from "pinia";

const app = createApp(App);
const pinia = createPinia();

app
  .use(initForm, {
    loader: () => import("@/configs/form-setup"),
  })
  .use(pinia)
  .mount("#app");
