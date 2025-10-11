import Runtime from "@/core/runtime";
import { UseFormOptions } from "@/helpers/useForm/types";

export function useForm(options: UseFormOptions) {
  const runtime = new Runtime(options);
  return [
    runtime.render(),
    {
      submit: runtime.submit.bind(runtime),
    },
  ];
}
