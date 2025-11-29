import { authGuard } from "@/router/guards/auth";
import { userInfoGuard } from "@/router/guards/userInfo";
import type { Router } from "vue-router";

export function applyGuards(router: Router) {
  authGuard(router);
  userInfoGuard(router);
}
