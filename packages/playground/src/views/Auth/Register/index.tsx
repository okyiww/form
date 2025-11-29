import { defineComponent, ref } from "vue";
import styles from "./index.module.scss";
import { raw, useForm } from "@okyiww/form";
import { Button, Input, Message } from "@arco-design/web-vue";
import { useRouter } from "vue-router";
import { authClient } from "@/business/auth";
import Link from "@/components/Link";
import { passwordValidator } from "@/utils/validators";

export default defineComponent({
  setup() {
    const loading = ref(false);
    const router = useRouter();
    const [Form, { submit }] = useForm({
      layoutGap: 0,
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
            type: "password",
          },
          rules: [
            {
              validator: passwordValidator,
            },
          ],
        },
        {
          label: "确认密码",
          field: "confirmPassword",
          component: Input,
          required: true,
          componentProps: {
            placeholder: "请输入确认密码",
            type: "password",
          },
          rules: ({ model }) => [
            {
              validator: (value, callback) => {
                if (value !== model.password) {
                  callback("两次密码不一致");
                } else {
                  callback();
                }
              },
            },
          ],
        },
      ],
      formProps: {
        layout: "vertical",
      },
    });

    function handleSubmit() {
      submit().then((res: any) => {
        loading.value = true;
        authClient.signUp.email(res).then(({ error }) => {
          if (error) {
            Message.error(error.message || "注册失败");
            loading.value = false;
            return;
          }
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

    function handleLogin() {
      router.push({
        name: "Login",
      });
    }

    return () => (
      <div class={styles.login}>
        <div class={styles.form}>
          <div class={styles.header}>注册</div>
          <Form />
          <Button type="primary" onClick={handleSubmit} loading={loading.value}>
            创建账户
          </Button>
          <div class={styles.footer}>
            已有账号? <Link onClick={handleLogin}>前往登录</Link>
          </div>
        </div>
      </div>
    );
  },
});
