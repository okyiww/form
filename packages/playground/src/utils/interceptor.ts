import { configs } from "@/configs";
import axios from "axios";
import { ResponseCode } from "@okyiww/nexus";

axios.defaults.baseURL = `${configs.basePath}/api`;

axios.interceptors.request.use((config) => {
  return config;
});

axios.interceptors.response.use((response) => {
  if (ResponseCode.SUCCESS === response.status) return response.data;
});
