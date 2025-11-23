import { defineStore } from "pinia";

export const useThemeStore = defineStore("theme", {
  state: () => ({
    sidebarCollapsed: false,
  }),
  actions: {
    setSidebarCollapsed(collapsed: boolean) {
      this.sidebarCollapsed = collapsed;
    },
  },
  getters: {
    isSidebarCollapsed: (state) => state.sidebarCollapsed,
  },
});
