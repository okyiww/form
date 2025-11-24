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
          label: "用户名",
          field: "username",
          component: Input,
          required: true,
          componentProps: {
            placeholder: "请输入用户名",
          },
        },
        {
          label: "昵称",
          field: "name",
          component: Input,
          required: true,
          componentProps: {
            placeholder: "请输入昵称",
          },
        },
        {
          label: "邮箱",
          field: "email",
          component: Input,
          required: true,
          componentProps: {
            placeholder: "请输入邮箱",
          },
        },
        {
          label: "密码",
          field: "password",
          component: Input,
          required: true,
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
      submit().then((res: any) => {
        authClient.signUp.email(res).then(({ data }) => {
          console.log(data);
        });
      });
    }

    function handleLogin() {
      router.push({
        name: "Login",
      });
    }

    return () => (
      <div class={styles.login}>
        <div class={styles.form}>
          <Form />
          <Button type="primary" onClick={handleLogin}>
            登录
          </Button>
          <Button type="primary" onClick={handleSubmit}>
            注册
          </Button>
        </div>
      </div>
    );
  },
});
