import axios from "axios";

export function fetchUserInfo() {
  return axios.get("user/info");
}
