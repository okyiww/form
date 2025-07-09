import { FormContext } from "@/context";
import { UseFormOptions } from "@/helpers/useForm/types";

export function useForm(options: UseFormOptions) {
  const { schemas } = options;
  console.log("schemas", schemas);
  return [FormContext.context];
}
