declare type AnyObject<T = any> = Record<PropertyKey, T>;
declare type AnyArray<T = any> = T[];
declare type AnyFunction = (...args: any) => any;
declare type AnyPromiseFn<T = any> = (...args: any) => Promise<T>;
