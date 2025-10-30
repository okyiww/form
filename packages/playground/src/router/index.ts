import { grabRoutes } from "@/router/routes";
import { keyBy } from "lodash";
import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
} from "vue-router";

export const routes = grabRoutes();
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

export function getTopParantRoute(_routeInfo: AnyObject) {
  let routeInfo = { ..._routeInfo };
  while (routeInfo.parentRoute) {
    routeInfo = routeInfo.parentRoute;
  }
  return routeInfo;
}

const router = createRouter({
  history: createWebHistory("/form-playground"),
  routes: [...routes],
});

export default router;
