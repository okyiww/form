/**
 * 我来说明一下我希望这个函数干啥
 * 首先，我希望函数可以自己判断传入的参数是 object 还是 function
 *
 * 并且根据 object 还是 function 进行对应的标记
 * 我还会推出 isRaw 的方法，在应用层使用，作为判断要不要处理的依据
 */

import { isObject, merge } from "lodash";

export function raw(value: any) {
  // happy path of any other types
  if (!isObject(value)) return value;

  return merge(value, {
    __okyiww_form_raw__: true,
  });
}

export function isRaw(value: any) {
  return value.__okyiww_form_raw__ === true;
}
