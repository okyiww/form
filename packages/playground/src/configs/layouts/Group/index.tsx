import { defineComponent } from "vue";
import styles from "./index.module.scss";

export default defineComponent({
  props: {},
  setup(props, { slots }) {
    return () => (
      <div class={styles.group}>
        <div class={styles.content}>{slots.default?.()}</div>
      </div>
    );
  },
});
