import { defineComponent } from "vue";
import styles from "./index.module.scss";
import PageContent from "@/components/PageContent";

export default defineComponent({
  props: {},
  setup(props) {
    return () => (
      <PageContent title="用户列表">
        <h1>UserList</h1>
      </PageContent>
    );
  },
});
