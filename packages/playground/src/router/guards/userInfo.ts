import { useUserStore } from "@/store/user";
import type { Router } from "vue-router";

export function userInfoGuard(router: Router) {
  const userStore = useUserStore();
  return router.beforeEach(async (to, from, next) => {
    if (userStore.isLoggedIn) {
      await userStore.refreshInfo();
      next();
      return;
    }
    next();
  });
}
