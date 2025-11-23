import { defineComponent } from "vue";
import { Icon } from "@iconify/vue";

export default defineComponent({
  props: {
    icon: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    return () => <Icon icon={props.icon} />;
  },
});
