import { defineComponent, ref, watch } from "vue";
import styles from "./index.module.scss";
import { Menu, MenuItem, SubMenu } from "@arco-design/web-vue";
import { getMenuByRouteName } from "@/router";
import { useRoute, useRouter, type RouteRecordRaw } from "vue-router";
import { useThemeStore } from "@/store/theme";
import Icon from "@/components/Icon";

export default defineComponent({
  setup() {
    const router = useRouter();
    const route = useRoute();
    const topParentRoute = ref<
      RouteRecordRaw & { parentRoute?: RouteRecordRaw }
    >();
    const selectedRouteName = ref<string[]>([]);
    const themeStore = useThemeStore();

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

    function spliceFirstWord(locale: string) {
      return locale.split("")[0];
    }

    function renderSubMenu(subMenuRoute: RouteRecordRaw) {
      const { locale, icon } = subMenuRoute.meta ?? {};

      // 两种情况
      // 1、有 icon -> 始终拥有 icon 插槽
      // 2、没有 icon -> 仅折叠时拥有 icon 插槽

      return (
        <SubMenu>
          {{
            title: () => {
              return locale;
            },
            default: () => {
              return subMenuRoute.children!.map(renderMenu);
            },
            icon: icon
              ? () => <Icon icon={icon as string} />
              : themeStore.isSidebarCollapsed
              ? spliceFirstWord(locale as string)
              : undefined,
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

    function handleCollapse(collapsed: boolean) {
      themeStore.setSidebarCollapsed(collapsed);
    }

    return () => (
      <div class={styles.sider}>
        <Menu
          class={styles.menu}
          selectedKeys={selectedRouteName.value}
          autoOpenSelected
          onMenuItemClick={handleMenuItemClick}
          showCollapseButton
          onCollapse={handleCollapse}
          breakpoint="xl"
        >
          {topParentRoute.value?.children?.map(renderMenu)}
        </Menu>
      </div>
    );
  },
});
