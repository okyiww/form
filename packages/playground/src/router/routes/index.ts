import type { RouteRecordRaw } from "vue-router";

export function applyRoutes() {
  const routes = import.meta.glob("@/router/routes/**/*.ts", {
    eager: true,
  }) as Record<string, { default: RouteRecordRaw }>;
  return Object.values(routes).map((route) => route.default);
}
