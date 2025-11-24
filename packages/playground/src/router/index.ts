import { configs } from "@/configs";
import { applyGuards } from "@/router/guards";
import { applyRoutes } from "@/router/routes";
import { keyBy } from "lodash";
import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
} from "vue-router";

export const routes = applyRoutes();
export const routesByName = generateRoutesByName(routes);

function generateRoutesByName(_routes, parentRoute?: RouteRecordRaw) {
  let routesByName = {};
  _routes.forEach((route) => {
    if (route.children) {
      routesByName = {
        ...routesByName,
        ...generateRoutesByName(route.children, {
          ...route,
          parentRoute,
        }),
      };
    }
    routesByName[route.name] = { ...route, parentRoute };
    return routesByName;
  });
  return routesByName;
}

export function getTopParantRoute(
  _routeInfo: RouteRecordRaw & { parentRoute?: RouteRecordRaw }
) {
  let routeInfo = { ..._routeInfo };
  while (routeInfo.parentRoute) {
    routeInfo = routeInfo.parentRoute;
  }
  return routeInfo;
}

export function filterHiddenRoutes(value: RouteRecordRaw[]) {
  return value.filter((route) => !route.meta?.hide);
}

export function getMenuByRouteName(routeName: string) {
  const routeInfo = routesByName[routeName];
  const topParentRoute = getTopParantRoute(routeInfo);
  return {
    currentSelectedKeys: [topParentRoute.name] as string[],
    topParentRoute,
  };
}

const router = createRouter({
  history: createWebHistory(configs.basePath),
  routes: [
    {
      name: "Login",
      path: "/login",
      meta: {
        skipAuth: true,
      },
      component: () => import("@/views/Auth/Login/index"),
    },
    {
      name: "Register",
      path: "/register",
      meta: {
        skipAuth: true,
      },
      component: () => import("@/views/Auth/Register/index"),
    },
    ...routes,
  ],
});

applyGuards(router);

export default router;
