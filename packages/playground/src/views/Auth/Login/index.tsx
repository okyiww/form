import { defineComponent, ref } from "vue";
import styles from "./index.module.scss";
import { raw, useForm } from "@okyiww/form";
import { Button, Input, Message } from "@arco-design/web-vue";
import { useRouter } from "vue-router";
import { authClient } from "@/business/auth";
import Link from "@/components/Link";
import { useUserStore } from "@/store/user";

export default defineComponent({
  setup() {
    const userStore = useUserStore();
    const loading = ref(false);
    const router = useRouter();
    const [Form, { submit }] = useForm({
      layoutGap: 0,
      schemas: [
        {
          label: "邮箱",
          field: "email",
          component: Input,
          componentProps: {
            placeholder: "请输入用户名",
          },
          required: true,
        },
        {
          label: "密码",
          field: "password",
          component: Input,
          componentProps: {
            placeholder: "请输入密码",
            type: "password",
            onPressEnter: raw(() => {
              handleSubmit();
            }),
          },
          required: true,
        },
      ],
      formProps: {
        layout: "vertical",
      },
    });

    function handleSubmit() {
      submit().then((res) => {
        loading.value = true;
        authClient.signIn.email(res).then(({ data, error }) => {
          if (error) {
            Message.error(error.message || "登录失败");
            loading.value = false;
            return;
          }
          userStore.setInfo(data.user);
          router
            .replace({
              name: "Home",
            })
            .then(() => {
              loading.value = false;
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
          <div class={styles.header}>登录</div>
          <Form />
          <Button type="primary" onClick={handleSubmit} loading={loading.value}>
            登录
          </Button>
          <div class={styles.footer}>
            没有账号? <Link onClick={handleRegister}>前往注册</Link>
          </div>
        </div>
      </div>
    );
  },
});
