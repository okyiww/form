import { FormContext } from "@/core/context";
import { SSR } from "@/core/context/types";
import Runtime from "@/core/runtime";
import { UseFormOptions } from "@/helpers/useForm/types";

/**
 * Todo: docs
 */

export function useForm(options: UseFormOptions) {
  const runtime = new Runtime(options);

  return [
    runtime.render(),
    {
      submit: runtime.submit.bind(runtime),
      share: runtime.share.bind(runtime),
      model: runtime._model.model,
      schemas: runtime._schema.parsedSchemas,
      isReady: runtime.isReady.bind(runtime),
      hydrate: runtime.hydrate.bind(runtime),
      getFormRef: runtime.getFormRef.bind(runtime),
    },
  ];
}
