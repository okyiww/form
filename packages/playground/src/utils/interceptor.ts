import { configs } from "@/configs";
import axios from "axios";
import { ResponseCode } from "@okyiww/nexus";
import { Message } from "@arco-design/web-vue";
import { useUserStore } from "@/store/user";

axios.defaults.baseURL = `${configs.basePath}/api`;

axios.interceptors.request.use((config) => {
  return config;
});

axios.interceptors.response.use(
  (response) => {
    if (ResponseCode.SUCCESS === response.status) return response.data;

    Message.error(response.data?.message || "系统错误");
    return Promise.reject(response.data);
  },
  (error) => {
    const userStore = useUserStore();
    if (ResponseCode.UNAUTHORIZED === error.response.status) {
      Message.error(error.response.data?.message || "登录已过期，请重新登录");
      userStore.logout();
      return Promise.reject(error.response.data);
    }
    Message.error(error.response?.data?.message || "系统错误");
    return Promise.reject(error);
  }
);
