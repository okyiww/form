import type { Router } from "vue-router";
import { authClient } from "@/business/auth";

export function authGuard(router: Router) {
  router.beforeEach(async (to, from, next) => {
    console.log("to", to);

    const session = await authClient.getSession();
    console.log("session", session);
    if (
      !session.data?.session ||
      session.data.session.expiresAt.getTime() < new Date().getTime()
    ) {
      if (to.meta.skipAuth) {
        next();
        return;
      }
      next({ name: "Login" });
      return;
    } else {
      console.log("金");
      if (to.name === "Login" || to.name === "Register") {
        next({ name: "Home" });
        return;
      }
    }
    next();
  });
}
