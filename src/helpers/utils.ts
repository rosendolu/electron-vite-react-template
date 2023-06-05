export function functionName(params) {
  //
}

export function composeQueryKeys(prev, newKeys): Record<string, any>[] {
  const prevKeys = prev[0];
  return [{ ...prevKeys, ...newKeys }];
}
