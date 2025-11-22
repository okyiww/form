import { v4Schema } from "@/modules/Auth/test_datas/v4Schema";
import { v5Schema } from "@/modules/Auth/test_datas/v5Schema";
import { v3Schema } from "@/modules/Auth/test_datas/v3Schema";
import { v6Schema } from "@/modules/Auth/test_datas/v6Schema";

export function getRegistSchemas() {
  return v5Schema();
}
