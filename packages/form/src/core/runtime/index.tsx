import { FormContext } from "@/core/context";
import Model from "@/core/lifecycle/Model";
import Render from "@/core/lifecycle/Render";
import Schema from "@/core/lifecycle/Schema";
import Update from "@/core/lifecycle/Update";
import { Component } from "@/helpers/defineFormSetup/types";
import { UseFormOptions } from "@/helpers/useForm/types";

export default class Runtime {
  public _schema: Schema;
  public _model: Model;
  public _render: Render;
  public _update: Update;
  public _options: UseFormOptions;
  public _context: FormContext;

  constructor(options: UseFormOptions) {
    this._options = options;
    this._context = FormContext;
    this._schema = new Schema(this);
    this._model = new Model(this);
    this._render = new Render(this);
    this._update = new Update(this);
  }

  render(): Component {
    return <>Form renderer</>;
  }
}
