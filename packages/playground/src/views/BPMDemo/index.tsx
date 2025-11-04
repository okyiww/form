import { defineComponent } from "vue";
import styles from "./index.module.scss";
import PageContent from "@/components/PageContent";

export default defineComponent({
  props: {},
  setup(props) {
    return () => (
      <PageContent>
        <div class={styles.bpmDemo}>
          <h1>BPMDemo</h1>
        </div>
      </PageContent>
    );
  },
});
