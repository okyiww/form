export interface SSR {
  renderComponent: (componentName: string) => any;
  definitions?: {
    dispatch?: string;
    model?: string;
    shared?: string;
    res?: string;
    err?: string;
    args?: string;
  };
  actions: {
    GET?: (params: AnyObject) => Promise<any>;
    POST?: (params: AnyObject) => Promise<any>;
    PUT?: (params: AnyObject) => Promise<any>;
    DELETE?: (params: AnyObject) => Promise<any>;
    PATCH?: (params: AnyObject) => Promise<any>;
    CONDITION?: (params: AnyObject) => Promise<any>;
    EVENT_HANDLER?: (params: AnyObject) => Promise<any>;
    SET_MODEL?: (params: AnyObject) => Promise<any>;
    SET_SHARED?: (params: AnyObject) => Promise<any>;
    GET_MODEL?: (params: AnyObject) => Promise<any>;
    GET_SHARED?: (params: AnyObject) => Promise<any>;
    REFS?: (params: AnyObject) => Promise<any>;
  } & AnyObject;
}
