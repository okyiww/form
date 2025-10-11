import Runtime from "@/core/runtime";
import { UseFormOptions } from "@/helpers/useForm/types";
import { watch } from "vue";

export function useForm(options: UseFormOptions) {
  const runtime = new Runtime(options);
  return [
    runtime.render(),
    {
      submit: runtime.submit.bind(runtime),
      share: runtime.share.bind(runtime),
      model: runtime._model.model,
      isReady: runtime.isReady.bind(runtime),
    },
  ];
}
