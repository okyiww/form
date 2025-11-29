import { defineComponent } from "vue";
import styles from "./index.module.scss";
import { useUserStore } from "@/store/user";
import { Avatar, Doption, Dropdown, Message } from "@arco-design/web-vue";
import { UserMenu } from "@/layouts/BasicLayout/User/types";

export default defineComponent({
  props: {},
  setup(props) {
    const userStore = useUserStore();

    function handleMenuSelect(key: UserMenu) {
      if (key === UserMenu.LOGOUT) {
        userStore.logout();
        return;
      }
      if (key === UserMenu.USERINFO) {
        Message.warning("功能开发中..");
      }
    }

    return () => (
      <div class={styles.user}>
        <Dropdown onSelect={handleMenuSelect}>
          {{
            default: () => <Avatar>{userStore.info.name}</Avatar>,
            content: () => (
              <>
                <Doption value={UserMenu.USERINFO}>个人中心</Doption>
                <Doption value={UserMenu.LOGOUT}>退出登录</Doption>
              </>
            ),
          }}
        </Dropdown>
      </div>
    );
  },
});
