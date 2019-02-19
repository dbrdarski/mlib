export const isPrimitive = (val) => Object(val) !== val;
export const isObject = (val) => Object(val) === val;
export const emptyObject = (o) => o.constructor();
export const copyObject = (o) => Object.assign(o.constructor(), o );
export const objectMap = (object, mapFn) => Object.keys(object).reduce(
  (result, key) => {
    result[key] = mapFn(object[key], key, object)
    return result
  }, {}
);
