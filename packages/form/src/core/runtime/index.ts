import Adapter from "@/core/adapter";
import { FormContext } from "@/core/context";
import Model from "@/core/lifecycle/Model";
import Render from "@/core/lifecycle/Render";
import Schema from "@/core/lifecycle/Schema";
import Update from "@/core/lifecycle/Update";
import { Component } from "@/helpers/defineFormSetup/types";
import { UseFormOptions } from "@/helpers/useForm/types";
import { nextTick, watch } from "vue";

export default class Runtime {
  public _schema: Schema;
  public _model: Model;
  public _render: Render;
  public _update: Update;
  public _options: UseFormOptions;
  public _context: FormContext;
  public _adapter: Adapter;
  public shared = {};

  constructor(options: UseFormOptions) {
    this._options = options;
    this._context = FormContext;
    this._model = new Model(this);
    this._render = new Render(this);
    this._update = new Update(this);
    this._schema = new Schema(this);
    this._adapter = new Adapter(this);
  }

  render(): Component {
    return this._render.render();
  }

  submit() {
    return this._adapter.adaptee.validate().then(() => {
      return this._model.model.value;
    });
  }

  share(shared: AnyObject, isModelTrigger = true) {
    this.shared = { ...this.shared, ...shared };
    // 这个锁是为了防止 share 无限触发，导致无限循环
    if (isModelTrigger) {
      // 当 share 被 model 触发时，不触发 share 的更新
      this._update.trigger("share");
    }
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
