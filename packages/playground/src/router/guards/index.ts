import { authGuard } from "@/router/guards/auth";
import { useRouter } from "vue-router";

export function applyGuards() {
  const router = useRouter();
  authGuard(router);
}
