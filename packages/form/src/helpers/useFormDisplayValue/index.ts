import { DisplayEntry } from "@/core/services/collectDisplayLabels";
import { Ref, unref } from "vue";

type ExposeFn = (exposed: Record<string, unknown>) => void;

export function useFormDisplayValue(
  modelValue: Ref<any> | (() => any),
  getLabel: () => string | string[] | null | undefined,
  expose: ExposeFn
) {
  expose({
    getDisplayValue(): DisplayEntry | null {
      const label = getLabel();
      if (label == null || label === "") return null;
      const value = typeof modelValue === "function" ? modelValue() : unref(modelValue);
      return { label, value };
    },
  });
}
