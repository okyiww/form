import { defineComponent, ref, watch } from "vue";

export default defineComponent({
  props: {
    modelValue: {
      type: Number,
      default: 0,
    },
  },
  emits: ["update:modelValue"],
  setup(props, { expose, emit }) {
    const count = ref(props.modelValue);

    watch(
      () => count.value,
      (newVal) => {
        emit("update:modelValue", newVal);
      }
    );

    watch(
      () => props.modelValue,
      (newVal) => {
        count.value = newVal;
      }
    );

    expose({
      increment: (...args: any[]) => {
        console.log("args", args);
        count.value++;
      },
      decrement: () => {
        count.value--;
      },
      theRemark: "hello the remark",
      getDisplayValue() {
        return {
          label: `计数: ${count.value}`,
          value: count.value,
        };
      },
    });
    return () => <div>{count.value}</div>;
  },
});
