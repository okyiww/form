import Runtime from "@/core/runtime";
import { UseFormOptions } from "@/helpers/useForm/types";
import { cloneDeep } from "lodash";

export function useForm(options: UseFormOptions) {
  console.log("called useForm", cloneDeep(options));
  const runtime = new Runtime(options);
  return [runtime.render()];
}
