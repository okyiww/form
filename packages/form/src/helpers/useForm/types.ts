import { RawSchemas } from "@/helpers/defineFormSchema/types";

export type UseFormOptions = {
  templateId?: string;
  schemas:
    | RawSchemas
    | ((...args: any[]) => RawSchemas)
    | ((...args: any[]) => Promise<RawSchemas>);
  layoutGap?: number;
  formProps?: any;
  formSlots?: any;
};
