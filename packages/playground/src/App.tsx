import { defineComponent } from "vue";
import { version, useForm } from "@okyiww/form";

export default defineComponent({
  setup() {
    console.log("the okyiww form version is", version);

    const [form] = useForm();
    console.log("form", form);

    return () => <div>the okyiww form version is {version}</div>;
  },
});
