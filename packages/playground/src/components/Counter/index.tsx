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
      increment: () => {
        count.value++;
      },
      decrement: () => {
        count.value--;
      },
    });
    return () => <div>{count.value}</div>;
  },
});
