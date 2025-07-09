import Model from "@/core/lifecycle/Model";
import Render from "@/core/lifecycle/Render";
import Schema from "@/core/lifecycle/Schema";
import Update from "@/core/lifecycle/Update";
import { Component } from "@/helpers/defineFormSetup/types";
import { UseFormOptions } from "@/helpers/useForm/types";

export default class Runtime {
  private _schema: Schema;
  private _model: Model;
  private _render: Render;
  private _update: Update;
  private _options: UseFormOptions;

  constructor(options: UseFormOptions) {
    this._options = options;
    this._schema = new Schema(this);
    this._model = new Model(this);
    this._render = new Render(this);
    this._update = new Update(this);
  }

  render(): Component {
    console.log("this", this);
    return <>Form renderer</>;
  }
}
