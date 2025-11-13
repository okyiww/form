import axios from "axios";

export function getRegistSchemas(): Promise<any> {
  return axios.get("auth/schemas");
}
