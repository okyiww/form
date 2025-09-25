import { defineComponent } from "vue";
import styles from "./index.module.scss";

export default defineComponent({
  setup(_, { slots }) {
    return () => (
      <div class={styles.item}>
        <div class={styles.content}>{slots.default?.()}</div>
      </div>
    );
  },
});
