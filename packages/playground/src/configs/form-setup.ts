import Group from "@/configs/layouts/Group";
import Item from "@/configs/layouts/Item";
import { Form, FormItem, List } from "@arco-design/web-vue";
import { defineFormSetup } from "@okyiww/form";

export default defineFormSetup({
  templates: [
    {
      id: "basic",
      adapter: "ArcoVue",
      providers: {
        Form,
        FormItem,
        layouts: {
          Item,
          Group,
          List,
        },
      },
    },
  ],
  default: {
    templateId: "basic",
  },
});
