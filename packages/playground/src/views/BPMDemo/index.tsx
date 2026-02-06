import { defineComponent, ref, onMounted, onBeforeUnmount } from "vue";
import styles from "./index.module.scss";
import PageContent from "@/components/PageContent";
import { useForm } from "@okyiww/form";
import axios from "axios";
import Counter from "@/components/Counter";
import { Button } from "@arco-design/web-vue";
import * as monaco from "monaco-editor";
import AIChatPanel from "./AIChatPanel";

const defaultSchemas = [
  {
    component: "Input",
    label: "姓名",
    field: "name",
    required: true,
  },
];

type RightTab = "ai" | "editor";

export default defineComponent({
  props: {},
  setup(props) {
    const editorRef = ref<HTMLDivElement>();
    const rightPanelWidth = ref(520);
    const jsonValid = ref(true);
    const lineCount = ref(0);
    const activeTab = ref<RightTab>("ai");
    let editor: monaco.editor.IStandaloneCodeEditor | null = null;
    let isDragging = false;

    const ssr: any = {
      renderComponent(componentName: string) {
        return import(`@arco-design/web-vue`).then((res) => {
          return { ...res, Counter }[componentName];
        });
      },
      actions: {
        GET: ({ target, path, params }: any) => {
          return axios.get(target, { params });
        },
        POST: ({ target, path, data }: any) => {
          return axios.post(target, data);
        },
      },
    };

    const [Form, { submit, updateForm }] = useForm({
      ssr,
      schemas: defaultSchemas,
    });

    function initEditor() {
      if (!editorRef.value || editor) return;
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

    onMounted(() => {
      // 延迟初始化编辑器（可能初始 tab 不在 editor）
      if (activeTab.value === "editor") {
        initEditor();
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
        updateForm({ ssr, schemas });
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

    function handleAIApplySchema(schema: any[]) {
      const json = JSON.stringify(schema, null, 2);
      if (editor) {
        editor.setValue(json);
      }
      updateForm({ ssr, schemas: schema });
    }

    function handleSwitchTab(tab: RightTab) {
      activeTab.value = tab;
      if (tab === "editor") {
        // 需要在 DOM 更新后初始化编辑器
        setTimeout(() => initEditor(), 50);
      }
    }

    function handleResizeStart(e: MouseEvent) {
      isDragging = true;
      const startX = e.clientX;
      const startWidth = rightPanelWidth.value;

      const handleMouseMove = (e: MouseEvent) => {
        if (!isDragging) return;
        const delta = startX - e.clientX;
        rightPanelWidth.value = Math.max(360, Math.min(900, startWidth + delta));
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
              {/* 左侧：表单预览（主角） */}
              <div class={styles.formPanel}>
                <div class={styles.formCard}>
                  <Form />
                </div>
              </div>

              {/* 拖拽条 */}
              <div class={styles.resizer} onMousedown={handleResizeStart} />

              {/* 右侧：Tab 切换面板 */}
              <div
                class={styles.rightPanel}
                style={{ width: `${rightPanelWidth.value}px` }}
              >
                {/* Tab 头 */}
                <div class={styles.tabBar}>
                  <div class={styles.tabs}>
                    <button
                      class={[
                        styles.tab,
                        activeTab.value === "ai" && styles.tabActive,
                      ]}
                      onClick={() => handleSwitchTab("ai")}
                    >
                      <span class={styles.tabIcon}>✦</span>
                      AI 助手
                    </button>
                    <button
                      class={[
                        styles.tab,
                        activeTab.value === "editor" && styles.tabActive,
                      ]}
                      onClick={() => handleSwitchTab("editor")}
                    >
                      <span class={styles.tabIconCode}>{`{}`}</span>
                      Schema
                    </button>
                  </div>
                </div>

                {/* Tab 内容 */}
                <div class={styles.tabContent}>
                  {/* AI 聊天 */}
                  <div
                    class={styles.tabPane}
                    style={{ display: activeTab.value === "ai" ? "flex" : "none" }}
                  >
                    <AIChatPanel onApplySchema={handleAIApplySchema} />
                  </div>

                  {/* Schema 编辑器 */}
                  <div
                    class={styles.tabPane}
                    style={{
                      display: activeTab.value === "editor" ? "flex" : "none",
                    }}
                  >
                    <div class={styles.editorToolbar}>
                      <div class={styles.editorActions}>
                        <Button size="mini" onClick={handleFixJson}>
                          转 JSON
                        </Button>
                        <Button size="mini" onClick={handleFormat}>
                          格式化
                        </Button>
                        <Button
                          type="primary"
                          size="mini"
                          onClick={handleApplySchema}
                        >
                          应用到表单
                        </Button>
                      </div>
                    </div>
                    <div ref={editorRef} class={styles.editor} />
                    <div class={styles.statusBar}>
                      <div class={styles.statusItem}>
                        <span
                          class={[
                            styles.statusDot,
                            !jsonValid.value && styles.error,
                          ]}
                        />
                        <span>
                          {jsonValid.value ? "JSON 有效" : "JSON 无效"}
                        </span>
                      </div>
                      <div class={styles.statusItem}>
                        <span>{lineCount.value} 行</span>
                      </div>
                    </div>
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
