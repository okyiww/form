import { defineComponent, ref, watch } from "vue";
import styles from "./index.module.scss";
import { Menu, MenuItem, SubMenu } from "@arco-design/web-vue";
import { getMenuByRouteName } from "@/router";
import { useRoute, useRouter, type RouteRecordRaw } from "vue-router";

export default defineComponent({
  setup() {
    const router = useRouter();
    const route = useRoute();
    const topParentRoute = ref<
      RouteRecordRaw & { parentRoute?: RouteRecordRaw }
    >();
    const selectedRouteName = ref<string[]>([]);

    watch(
      () => route.name,
      (newRouteName) => {
        const {
          topParentRoute: _topParentRoute,
          currentSelectedKeys: _currentSelectedKeys,
        } = getMenuByRouteName(newRouteName as string);
        topParentRoute.value = _topParentRoute;
        selectedRouteName.value = [newRouteName as string];
      },
      {
        immediate: true,
      }
    );

    function renderMenu(childRoute: RouteRecordRaw) {
      const isSubMenu = (childRoute.children?.length ?? 0) > 0;

      return isSubMenu ? renderSubMenu(childRoute) : renderMenuItem(childRoute);
    }

    function renderSubMenu(subMenuRoute: RouteRecordRaw) {
      const { locale } = subMenuRoute.meta ?? {};
      return (
        <SubMenu>
          {{
            title: () => {
              return locale;
            },
            default: () => {
              return subMenuRoute.children!.map(renderMenu);
            },
          }}
        </SubMenu>
      );
    }

    function renderMenuItem(itemMenuRoute: RouteRecordRaw) {
      const { locale } = itemMenuRoute.meta ?? {};
      return (
        <MenuItem key={itemMenuRoute.name}>
          {{
            default: () => {
              return locale;
            },
          }}
        </MenuItem>
      );
    }

    function handleMenuItemClick(routeName: string) {
      router.push({ name: routeName });
    }

    return () => (
      <div class={styles.sider}>
        <Menu
          selectedKeys={selectedRouteName.value}
          autoOpenSelected
          onMenuItemClick={handleMenuItemClick}
        >
          {topParentRoute.value?.children?.map(renderMenu)}
        </Menu>
      </div>
    );
  },
});
