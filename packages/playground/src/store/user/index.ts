import { authClient } from "@/business/auth";
import { fetchUserInfo } from "@/business/user";
import router from "@/router";
import type { UserInfo } from "@/store/user/types";
import { defineStore } from "pinia";

export const useUserStore = defineStore("user", {
  state: () => ({
    info: {} as UserInfo,
  }),
  actions: {
    async refreshInfo() {
      const session = await fetchUserInfo();
      if (session.data?.user) {
        this.info = session.data.user;
      }
    },
    setInfo(info: UserInfo) {
      this.info = info;
    },
    logout() {
      this.info = {} as UserInfo;
      authClient.signOut();
      router.replace({ name: "Login" });
    },
  },
  getters: {
    isLoggedIn: (state) => {
      return !!state.info.id;
    },
  },
  persist: true,
});
