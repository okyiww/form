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
import { nextTick, watch } from "vue";

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
  };

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
    this.isReady(() => {
      this._model.model.value = {
        ...this._model.model.value,
        ...model,
      };
    });
  }

  getFormRef() {
    return this._render.formRef;
  }
}
