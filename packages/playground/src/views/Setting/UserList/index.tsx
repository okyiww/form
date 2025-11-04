import { defineComponent } from "vue";
import styles from "./index.module.scss";

export default defineComponent({
  props: {},
  setup(props) {
    return () => <h1>UserList</h1>;
  },
});
