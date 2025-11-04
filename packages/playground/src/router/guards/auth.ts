import type { Router } from "vue-router";

export function authGuard(router: Router) {
  router.beforeEach((to, from, next) => {
    next();
  });
}
