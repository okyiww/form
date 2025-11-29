import type { Router } from "vue-router";
import { useUserStore } from "@/store/user";

export function authGuard(router: Router) {
  const userStore = useUserStore();
  router.beforeEach(async (to, from, next) => {
    if (!userStore.isLoggedIn) {
      if (to.meta.skipAuth) {
        next();
        return;
      }
      next({ name: "Login" });
      return;
    } else {
      if (to.name === "Login" || to.name === "Register") {
        next({ name: "Home" });
        return;
      }
      next();
    }
  });
}
