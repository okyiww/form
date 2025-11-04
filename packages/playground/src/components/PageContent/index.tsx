import { defineComponent } from "vue";
import styles from "./index.module.scss";

export default defineComponent({
  props: {
    spaceAround: {
      type: Number,
      default: 8,
    },
    insetSpaceAround: {
      type: Array,
      default: [16, 8],
    },
    title: {
      type: String,
      default: "",
    },
    fillRemaining: {
      type: Boolean,
      default: true,
    },
  },
  setup(props, { slots }) {
    const hasHeader = !!(slots.header || props.title || slots.headerRight);

    function renderHeader() {
      if (slots.header) {
        return slots.header?.();
      }

      return (
        <>
          <div class={styles.title}>{props.title}</div>
          {slots.headerRight?.()}
        </>
      );
    }

    return () => (
      <div
        class={[
          styles.pageContent,
          props.fillRemaining && styles.fillRemaining,
        ]}
        style={{
          "--space-around": `${props.spaceAround}px`,
          "--inset-space-around": `${props.insetSpaceAround[0]}px ${props.insetSpaceAround[1]}px`,
        }}
      >
        {hasHeader && <div class={styles.header}>{renderHeader()}</div>}
        <div class={styles.content}>{slots.default?.()}</div>
      </div>
    );
  },
});
