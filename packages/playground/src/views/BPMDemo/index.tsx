import { defineComponent, ref, onMounted, onBeforeUnmount } from "vue";
import styles from "./index.module.scss";
import PageContent from "@/components/PageContent";
import { useForm } from "@okyiww/form";
import axios from "axios";
import Counter from "@/components/Counter";
import { Button } from "@arco-design/web-vue";
import * as monaco from "monaco-editor";

const defaultSchemas = [
  {
    component: "Input",
    label: "姓名",
    field: "name",
    required: true,
  },
];

export default defineComponent({
  props: {},
  setup(props) {
    const editorRef = ref<HTMLDivElement>();
    const editorPanelRef = ref<HTMLDivElement>();
    const editorWidth = ref(480);
    const jsonValid = ref(true);
    const lineCount = ref(0);
    let editor: monaco.editor.IStandaloneCodeEditor | null = null;
    let isDragging = false;

    const ssr: any = {
      renderComponent(componentName: string) {
        return import(`@arco-design/web-vue`).then((res) => {
          return { ...res, Counter }[componentName];
        });
      },
      actions: {
        GET: ({ target, path, params }) => {
          return axios.get(target, { params });
        },
        POST: ({ target, path, data }) => {
          return axios.post(target, data);
        },
      },
    };

    const [Form, { submit, updateForm }] = useForm({
      ssr,
      schemas: defaultSchemas,
    });

    onMounted(() => {
      if (editorRef.value) {
        const initialValue = JSON.stringify(defaultSchemas, null, 2);
        editor = monaco.editor.create(editorRef.value, {
          value: initialValue,
          language: "json",
          theme: "vs",
          minimap: { enabled: false },
          automaticLayout: true,
          formatOnPaste: true,
          formatOnType: true,
          tabSize: 2,
          scrollBeyondLastLine: false,
          fontSize: 13,
          lineHeight: 20,
          padding: { top: 12, bottom: 12 },
          renderLineHighlight: "all",
          bracketPairColorization: { enabled: true },
          smoothScrolling: true,
          cursorBlinking: "smooth",
          cursorSmoothCaretAnimation: "on",
        });

        lineCount.value = editor.getModel()?.getLineCount() || 0;

        editor.onDidChangeModelContent(() => {
          const content = editor?.getValue() || "";
          lineCount.value = editor?.getModel()?.getLineCount() || 0;
          try {
            JSON.parse(content);
            jsonValid.value = true;
          } catch {
            jsonValid.value = false;
          }
        });
      }
    });

    onBeforeUnmount(() => {
      editor?.dispose();
    });

    function handleSubmit() {
      submit().then((res: any) => {
        console.log(res);
      });
    }

    function handleApplySchema() {
      if (!editor || !jsonValid.value) return;
      try {
        const schemas = JSON.parse(editor.getValue());
        updateForm({
          ssr,
          schemas,
        });
      } catch (e) {
        console.error("Invalid JSON:", e);
      }
    }

    function handleFormat() {
      editor?.getAction("editor.action.formatDocument")?.run();
    }

    function handleFixJson() {
      if (!editor) return;
      const text = editor.getValue();
      try {
        // eslint-disable-next-line no-eval
        const obj = new Function(`return ${text}`)();
        editor.setValue(JSON.stringify(obj, null, 2));
      } catch (e) {
        console.error("无法转换为 JSON:", e);
      }
    }

    function handleResizeStart(e: MouseEvent) {
      isDragging = true;
      const startX = e.clientX;
      const startWidth = editorWidth.value;

      const handleMouseMove = (e: MouseEvent) => {
        if (!isDragging) return;
        const delta = startX - e.clientX;
        editorWidth.value = Math.max(200, Math.min(800, startWidth + delta));
      };

      const handleMouseUp = () => {
        isDragging = false;
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => (
      <PageContent title="BPM 示例">
        {{
          default: () => (
            <div class={styles.container}>
              <div class={styles.formPanel}>
                <div class={styles.formCard}>
                  <Form />
                </div>
              </div>
              <div class={styles.resizer} onMousedown={handleResizeStart} />
              <div
                ref={editorPanelRef}
                class={styles.editorPanel}
                style={{ width: `${editorWidth.value}px` }}
              >
                <div class={styles.editorHeader}>
                  <div class={styles.title}>
                    <span class={styles.titleIcon}>{`{ }`}</span>
                    <span>Schema 编辑器</span>
                  </div>
                  <div class={styles.editorActions}>
                    <Button size="small" onClick={handleFixJson}>
                      转 JSON
                    </Button>
                    <Button size="small" onClick={handleFormat}>
                      格式化
                    </Button>
                    <Button type="primary" size="small" onClick={handleApplySchema}>
                      应用
                    </Button>
                  </div>
                </div>
                <div ref={editorRef} class={styles.editor} />
                <div class={styles.statusBar}>
                  <div class={styles.statusItem}>
                    <span
                      class={[styles.statusDot, !jsonValid.value && styles.error]}
                    />
                    <span>{jsonValid.value ? "JSON 有效" : "JSON 无效"}</span>
                  </div>
                  <div class={styles.statusItem}>
                    <span>{lineCount.value} 行</span>
                  </div>
                </div>
              </div>
            </div>
          ),
          headerRight: () => (
            <Button type="primary" onClick={handleSubmit}>
              提交
            </Button>
          ),
        }}
      </PageContent>
    );
  },
});
