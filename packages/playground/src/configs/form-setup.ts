import Item from "@/configs/layouts/Item";
import Group from "@/configs/layouts/Group";
import List from "@/configs/layouts/List";
import ListItem from "@/configs/layouts/ListItem";
import { Form, FormItem } from "@arco-design/web-vue";
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
          ListItem,
        },
      },
    },
  ],
  default: {
    templateId: "basic",
  },
});
