import { processDynamicValue } from "@/core/lifecycle/hooks/useDispatchHandler/processDynamicValue";
import Runtime from "@/core/runtime";

export async function processRequests(
  dispatch: keyof typeof runtime.ssr.actions,
  data: AnyObject,
  utils: AnyObject,
  runtime: Runtime,
  runtimeInfo?: AnyObject
) {
  const action = runtime.ssr.actions[dispatch];

  const processedParams = processParams(data, utils, runtime, runtimeInfo);
  const processedData = processData(data, utils, runtime, runtimeInfo);

  return await action?.({
    ...data,
    params: processedParams,
    data: processedData,
  });
}

function processParams(
  data: AnyObject,
  utils: AnyObject,
  runtime: Runtime,
  runtimeInfo?: AnyObject
) {
  if (!data.params) return {};
  const processedParams: AnyObject = {};

  Object.entries(data.params).forEach(([key, value]: [string, any]) => {
    processedParams[key] = processDynamicValue(
      value,
      utils,
      runtime,
      runtimeInfo
    );
  });

  return processedParams;
}

function processData(
  data: AnyObject,
  utils: AnyObject,
  runtime: Runtime,
  runtimeInfo?: AnyObject
) {
  if (!data.data) return {};
  const processedData: AnyObject = {};

  Object.entries(data.data).forEach(([key, value]: [string, any]) => {
    processedData[key] = processDynamicValue(
      value,
      utils,
      runtime,
      runtimeInfo
    );
  });

  return processedData;
}
