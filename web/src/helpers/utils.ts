export function functionName(params) {
  //
}

export function composeQueryKeys(prev, newKeys): Record<string, any>[] {
  const prevKeys = prev[0];
  return [{ ...prevKeys, ...newKeys }];
}

export const deepClone = obj => {
  const clone = Object.assign({}, obj);
  Object.keys(clone).forEach(key => (clone[key] = typeof obj[key] === 'object' ? deepClone(obj[key]) : obj[key]));
  return Array.isArray(obj) ? (clone.length = obj.length) && Array.from(clone) : clone;
};
