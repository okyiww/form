import { defineComponent } from "vue";
import styles from "./index.module.scss";

export default defineComponent({
  props: {
    onClick: {
      type: Function,
      required: true,
    },
  },
  setup(props, { slots }) {
    return () => (
      <a class={styles.link} onClick={(e) => props.onClick(e)}>
        {slots.default?.()}
      </a>
    );
  },
});
