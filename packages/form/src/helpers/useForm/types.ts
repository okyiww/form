import { SSR } from "@/core/context/types";
import { RawSchemas } from "@/helpers/defineFormSchema/types";

export type UseFormOptions = {
  templateId?: string;
  noAutoLookup?: boolean;
  schemas:
    | RawSchemas
    | ((...args: any[]) => RawSchemas)
    | ((...args: any[]) => Promise<RawSchemas>);
  layoutGap?: number;
  listLayoutGap?: number;
  formProps?: any;
  formSlots?: any;
  ssr?: SSR;
  namesToRemember?: Record<string, string>;
};
