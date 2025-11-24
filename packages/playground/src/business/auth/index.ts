import { createAuthClient } from "better-auth/vue";
import { configs } from "@/configs";
export const authClient = createAuthClient({
  baseURL: configs.authBasePath,
});
