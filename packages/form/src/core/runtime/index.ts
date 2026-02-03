import Adapter from "@/core/adapter";
import { FormContext } from "@/core/context";
import { SSR } from "@/core/context/types";
import Model from "@/core/lifecycle/Model";
import Render from "@/core/lifecycle/Render";
import Schema from "@/core/lifecycle/Schema";
import Update from "@/core/lifecycle/Update";
import { Component } from "@/helpers/defineFormSetup/types";
import { UseFormOptions } from "@/helpers/useForm/types";
import onChange from "on-change";
import {
  computed,
  ComputedRef,
  nextTick,
  reactive,
  ref,
  Ref,
  watch,
} from "vue";
import {
  transformModelByRememberedNames,
  reverseTransformModelByRememberedNames,
} from "@/helpers/namesToRemember";
import { set } from "lodash";
import { RawSchemas } from "@/helpers/defineFormSchema/types";

export default class Runtime {
  public _schema: Schema;
  public _model: Model;
  public _render: Render;
  public _update: Update;
  public _options: UseFormOptions;
  public _context: FormContext;
  public _adapter: Adapter;
  public shared = onChange({}, (path) => {
    this._update.trigger("share", path);
  });
  public isSsr = false;
  public ssr = {} as SSR;
  public defaultSSRDefinitions = {
    dispatch: "$dispatch",
    model: "$model",
    shared: "$shared",
    res: "$res",
    err: "$err",
    args: "$args",
  };
  public lookups: Ref<Map<string, any>> = ref(new Map());
  public lookupResults: Ref<Map<string, any>> = ref(new Map());

  constructor(options: UseFormOptions) {
    this._options = options;
    this.processSSR(options);
    this._context = FormContext;
    this._model = new Model(this);
    this._render = new Render(this);
    this._update = new Update(this);
    this._schema = new Schema(this);
    this._adapter = new Adapter(this);
  }

  getLookupResults(): ComputedRef<Map<string, any>>;
  getLookupResults(path: string): ComputedRef<any>;
  getLookupResults(path?: string): ComputedRef<any> {
    // 不传 path，返回全量
    if (path === undefined) {
      return computed(() => Array.from(this.lookupResults.value.values()));
    }

    // 传 path，返回指定项
    return computed(() => this.lookupResults.value.get(path));
  }

  processSSR(options: UseFormOptions) {
    if (options.ssr) {
      this.isSsr = true;
      this.ssr = options.ssr;
      this.ssr.definitions = {
        ...this.defaultSSRDefinitions,
        ...options.ssr.definitions,
      };
    } else {
      // 这个地方在调整后即使是不写这段也没事，因为 ssr 的判定是跟着 useForm 走的
      // 这样他有独立上下文，避免了多个 form 在一个页面时的侵染
      this.isSsr = false;
      this.ssr = {} as SSR;
    }
  }

  render(): Component {
    return this._render.render();
  }

  submit() {
    return this._adapter.adaptee.validate().then(() => {
      if (this._options.namesToRemember) {
        return transformModelByRememberedNames(
          this._model.model.value,
          this._options.namesToRemember
        );
      }
      return this._model.model.value;
    });
  }

  share(shared: AnyObject) {
    Object.assign(this.shared, shared);
  }

  isReady(handler: AnyFunction) {
    const unwatch = watch(
      () => this._model.allConsumed.value,
      (val) => {
        if (val) {
          setTimeout(() => {
            handler();
            nextTick(() => {
              unwatch();
            });
          }, 0);
        }
      },
      {
        immediate: true,
        deep: true,
      }
    );
  }

  hydrate(model: AnyObject) {
    return new Promise((resolve) => {
      this.isReady(() => {
        const transformedModel = this._options.namesToRemember
          ? reverseTransformModelByRememberedNames(
              model,
              this._options.namesToRemember
            )
          : model;

        Object.keys(transformedModel).forEach((key) => {
          this._model.model.value[key] = transformedModel[key];
        });
        resolve(this._model.model.value);
      });
    });
  }

  deleteField(path: string) {
    // 删除 lookupResults 中的对应条目
    this.lookupResults.value.delete(path);
    // 删除 formModel 中的对应字段
    set(this._model.model.value, path, undefined);
  }

  getFormRef() {
    return this._render.formRef;
  }

  /**
   * 使用新的 schema 重新渲染整个表单
   */
  updateForm(options: UseFormOptions) {
    this._options = options;
    // 暂停 onChange 回调，避免清理过程中触发副作用
    this._model.pauseOnChange = true;

    // 先重置 update 追踪，避免后续操作触发旧的 effects
    this._update.reset();

    // 重置 model 状态
    this._model.relationMap.clear();
    this._model.allConsumed.value = false;
    this._model.immutableModel = {};
    Object.keys(this._model.model.value).forEach((key) => {
      delete this._model.model.value[key];
    });

    // 重置 lookup 状态
    this.lookups.value.clear();
    this.lookupResults.value.clear();

    // 重置 shared 状态
    Object.keys(this.shared).forEach((key) => {
      delete this.shared[key as keyof typeof this.shared];
    });

    // 更新 options 中的 schemas
    this._options.schemas = options.schemas;

    // 重置 schema 并用新的 schema 重新解析
    this._schema.parsedSchemas.value = [];
    this._schema.refs.clear();
    this._schema.usageTracker.clear();
    this._schema.rawSchemas = undefined;

    // 恢复 onChange 回调
    this._model.pauseOnChange = false;

    this._schema.processSchemas();
  }
}
