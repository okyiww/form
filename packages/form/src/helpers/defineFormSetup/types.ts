export type Component = any;

export type BuiltInAdapter = "ArcoVue" | (string & {});

export type CustomAdapter = {};

export type Template = {
  id: string;
  adapter: BuiltInAdapter | CustomAdapter;
  providers: {
    Form: Component;
    FormItem: Component;
    layouts: {
      Item: Component;
      Group: Component;
      List: Component;
    };
  };
};

export type DefineFormSetupOptions = {
  templates: Template[];
  default: {
    templateId: string;
  };
};
