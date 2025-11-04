import { defineComponent } from "vue";
import styles from "./index.module.scss";
import { RouterView } from "vue-router";
import {
  Layout,
  LayoutContent,
  LayoutHeader,
  LayoutSider,
} from "@arco-design/web-vue";
import Header from "@/layouts/BasicLayout/Header";
import { useThemeStore } from "@/store/theme";
import Sider from "@/layouts/BasicLayout/Sider";

export default defineComponent({
  setup() {
    const themeStore = useThemeStore();
    return () => (
      <Layout class={styles.basicLayout}>
        <LayoutHeader class={styles.header}>
          <Header />
        </LayoutHeader>
        <Layout>
          <LayoutSider collapsed={themeStore.sidebarCollapsed}>
            <Sider />
          </LayoutSider>
          <LayoutContent class={styles.content}>
            <RouterView />
          </LayoutContent>
        </Layout>
      </Layout>
    );
  },
});
