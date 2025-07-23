import { DefineFormSetupOptions } from "@/helpers/defineFormSetup/types";

export type FormSetupLoader = () => Promise<{
  default: DefineFormSetupOptions;
}>;
