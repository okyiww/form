export function isRequestDispatch(dispatch: string) {
  return ["GET", "POST", "PUT", "DELETE", "PATCH"].includes(dispatch);
}

export function isConditionDispatch(dispatch: string) {
  return ["CONDITION"].includes(dispatch);
}

export function isEventHandlerDispatch(dispatch: string) {
  return ["EVENT_HANDLER"].includes(dispatch);
}

export function isSetModelDispatch(dispatch: string) {
  return ["SET_MODEL"].includes(dispatch);
}

export function isSetSharedDispatch(dispatch: string) {
  return ["SET_SHARED"].includes(dispatch);
}

export function isGetModelDispatch(dispatch: string) {
  return ["GET_MODEL"].includes(dispatch);
}

export function isGetSharedDispatch(dispatch: string) {
  return ["GET_SHARED"].includes(dispatch);
}

export function isRefsDispatch(dispatch: string) {
  return ["REFS"].includes(dispatch);
}
