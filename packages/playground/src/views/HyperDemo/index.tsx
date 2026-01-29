import {
  defineComponent,
  nextTick,
  onBeforeMount,
  onMounted,
  ref,
  watch,
} from "vue";
import { version, useForm } from "@okyiww/form";
import { Button } from "@arco-design/web-vue";
import styles from "./index.module.scss";
import PageContent from "@/components/PageContent";

export default defineComponent({
  setup() {
    console.log("the okyiww form version is", version);

    function getSchemas() {
      return import("@/business/schemas/hyperSave").then((res) => res.default);
    }

    const [
      Form,
      {
        submit,
        hydrate,
        schemas,
        share,
        isReady,
        getFormRef,
        getLookupResults,
        triggerLookup,
      },
    ] = useForm({
      schemas: getSchemas,
      formProps: {
        layout: "vertical",
      },
    });

    const lookupResults = getLookupResults();

    function handleSubmit() {
      submit().then((res: any) => {
        console.log(res);
      });
    }

    hydrate({
      name: "123",
      gender: ["female"],
      gender2: ["male"],
    }).then(() => {
      triggerLookup();
    });

    function renderMatchStatus(item) {
      return (
        <div>
          {item.label}
          {item.matchResult}
          <Button onClick={() => item?.delete?.()}>删除</Button>
        </div>
      );
    }

    return () => (
      <PageContent title="进阶示例">
        {{
          default: () => (
            <div class={styles.app}>
              <div>the okyiww form version is {version}</div>
              <Form />

              {lookupResults.value.map(renderMatchStatus)}
            </div>
          ),
          headerRight: () => (
            <>
              <Button type="primary" onClick={handleSubmit}>
                提交
              </Button>
              <Button type="primary" onClick={triggerLookup}>
                触发 lookup
              </Button>
            </>
          ),
        }}
      </PageContent>
    );
  },
});
