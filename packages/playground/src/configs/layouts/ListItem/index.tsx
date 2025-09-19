import { defineComponent } from "vue";
import styles from "./index.module.scss";
import { Button } from "@arco-design/web-vue";

export default defineComponent({
  props: {},
  setup(props, { slots }) {
    return () => (
      <div class={styles.listItem}>
        <div class={styles.content}>{slots.default?.()}</div>
        <div class={styles.footer}>
          {slots.delete?.({
            render: () => (
              <Button class={styles.deleteButton} type="primary">
                删除
              </Button>
            ),
          })}
        </div>
      </div>
    );
  },
});
