import { defineComponent } from "vue";
import styles from "./index.module.scss";
import { useForm } from "@okyiww/form";
import { Button, Input } from "@arco-design/web-vue";
import { useRouter } from "vue-router";
import { authClient } from "@/business/auth";

export default defineComponent({
  props: {},
  setup(props) {
    const router = useRouter();
    const [Form, { submit }] = useForm({
      schemas: [
        {
          label: "邮箱",
          field: "email",
          component: Input,
          componentProps: {
            placeholder: "请输入用户名",
          },
        },
        {
          label: "密码",
          field: "password",
          component: Input,
          componentProps: {
            placeholder: "请输入密码",
          },
        },
      ],
      formProps: {
        layout: "vertical",
      },
    });

    function handleSubmit() {
      submit().then((res) => {
        authClient.signIn.email(res).then(({ data }) => {
          router.push({
            name: "Home",
          });
        });
      });
    }

    function handleRegister() {
      router.push({
        name: "Register",
      });
    }

    return () => (
      <div class={styles.login}>
        <div class={styles.form}>
          <Form />
          <Button type="primary" onClick={handleSubmit}>
            登录
          </Button>
          <Button type="primary" onClick={handleRegister}>
            注册
          </Button>
        </div>
      </div>
    );
  },
});
