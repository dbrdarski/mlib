export const isPrimitive = (val) => Object(val) !== val;
export const isObject = (val) => Object(val) === val;
export const isCallable = (f) => typeof f === 'function';
export const empty = (o) => o.constructor();
export const copy = (o) => Object.assign(o.constructor(), o);
export const filter = (object, fn) => Object.keys(object).reduce(
  (acc, key) => {
    if(fn(object[key], key, object)){
      acc[key] = object[key];
    }
    return acc;
  }, {}
);
export const map = (object, fn) => Object.keys(object).reduce(
  (acc, key) => {
    acc[key] = fn(object[key], key, object);
    return acc;
  }, {}
);
export const reduce = (object, fn, initial) => Object.keys(object).reduce(
  (acc, key) => {
    acc[key] = fn(object[key], key, object);
    return acc;
  }, initial
);
export const each = (object, fn) => {
  const keys = Object.keys(object);
  // console.log('====EACH====')
  // console.log({object, fn, keys, length: keys.length})
  // console.log('============')
  return keys.forEach(
    (key) => {
      fn(object[key], key, object);
    }
  )
};
export const logger = (log = []) => (...args) => {
  if (args.length){
    log.push(
      args.length > 1
        ? args
        : args[0]
    )
  } else {
    return log;
  }
}
