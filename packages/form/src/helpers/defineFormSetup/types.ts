export type Component = any;

export type BuiltInAdapter = "ArcoVue" | (string & {});

export type CustomAdapter = {
  formModelName: string;
  formModelKey: string; // 用于唯一标识某个表单域
  validate: () => Promise<void>;
};

export type Template =
  | {
      id: string;
      adapter: BuiltInAdapter;
      providers: {
        Form: Component;
        FormItem: Component;
        layouts: {
          Item: Component;
          Group: Component;
          List: Component;
          ListItem: Component;
        } & Record<string, Component>;
      };
    }
  | {
      id: string;
      customAdapter: CustomAdapter;
      providers: {
        Form: Component;
        FormItem: Component;
        layouts: {
          Item: Component;
          Group: Component;
          List: Component;
          ListItem: Component;
        } & Record<string, Component>;
      };
    }
  | {
      id: string;
      adapter: BuiltInAdapter; // 同时都存在时默认认为继承了 adpater 的内容，同时 custom 中的同名的策略会补充进去作为覆盖
      customAdapter: Partial<CustomAdapter>;
      providers: {
        Form: Component;
        FormItem: Component;
        layouts: {
          Item: Component;
          Group: Component;
          List: Component;
          ListItem: Component;
        } & Record<string, Component>;
      };
    };

export type DefineFormSetupOptions = {
  templates: Template[];
  default: {
    templateId: string;
  };
};
