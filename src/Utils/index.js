export const isPrimitive = (val) => Object(val) !== val;
export const isObject = (val) => Object(val) === val;
export const emptyObject = (o) => o.constructor();
export const copyObject = (o) => Object.assign(o.constructor(), o );
export const objectFilter = (object, filterFn) => Object.keys(object).reduce(
  (result, key) => {
    if(filterFn(object[key], key, object)){
      result[key] = object[key];
    }
    return result;
  }, {}
);
export const objectMap = (object, mapFn) => Object.keys(object).reduce(
  (result, key) => {
    result[key] = mapFn(object[key], key, object);
    return result;
  }, {}
);
