import { defineComponent } from "vue";
import styles from "./index.module.scss";
import { RouterView } from "vue-router";

export default defineComponent({
  setup() {
    return () => (
      <div class={styles.basicLayout}>
        <RouterView />
      </div>
    );
  },
});
