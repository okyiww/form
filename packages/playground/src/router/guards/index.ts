import { authGuard } from "@/router/guards/auth";
import type { Router } from "vue-router";

export function applyGuards(router: Router) {
  authGuard(router);
}
