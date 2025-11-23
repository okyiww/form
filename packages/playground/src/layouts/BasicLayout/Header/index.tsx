import { defineComponent, ref, watch } from "vue";
import styles from "./index.module.scss";
import { Menu, MenuItem } from "@arco-design/web-vue";
import { filterHiddenRoutes, getMenuByRouteName, routes } from "@/router";
import { useRoute, useRouter, type RouteRecordRaw } from "vue-router";
import User from "@/layouts/BasicLayout/User";

export default defineComponent({
  setup() {
    const router = useRouter();
    const route = useRoute();
    const currentSelectedKeys = ref<string[]>([]);

    function handleMenuClick(route: RouteRecordRaw) {
      router.push({ name: route.name });
    }

    watch(
      () => route.name,
      (newRouteName) => {
        currentSelectedKeys.value = getMenuByRouteName(
          newRouteName as string
        ).currentSelectedKeys;
      },
      {
        immediate: true,
      }
    );

    function renderMenu(route: RouteRecordRaw) {
      return (
        <MenuItem key={route.name} onClick={() => handleMenuClick(route)}>
          {{
            default: () => {
              return route.meta?.locale;
            },
          }}
        </MenuItem>
      );
    }

    return () => (
      <div class={styles.header}>
        <div class={styles.sysPanel}>
          <div class={styles.title}>Form</div>
          <Menu
            class={styles.menu}
            selectedKeys={currentSelectedKeys.value}
            mode="horizontal"
          >
            {filterHiddenRoutes(routes).map(renderMenu)}
          </Menu>
        </div>

        <div class={styles.userPanel}>
          <User />
        </div>
      </div>
    );
  },
});
