import { defineComponent } from "vue";
import styles from "./index.module.scss";

export default defineComponent({
  props: {},
  setup(props) {
    return () => (
      <div class={styles.bpmDemo}>
        <h1>BPMDemo</h1>
      </div>
    );
  },
});
