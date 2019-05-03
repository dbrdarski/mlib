export const isPrimitive = (val) => Object(val) !== val;
export const isObject = (val) => Object(val) === val;
export const isCallable = (f) => typeof f === 'function';
export const pipe = (...fns) => arg => fns.reduce((acc, fn) => fn(acc), arg);
export const empty = (o) => o.constructor();
export const copy = (o) => Object.assign(o.constructor(), o);
export const length = (o) => Object.keys(o).length;
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
export const each = (object, fn) =>  Object.keys(object).forEach(
  (key) => {
    fn(object[key], key, object);
  }
);
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
export const hash = function(str) {
  var hash = 0, i, chr;
  if (str.length === 0) return hash;
  for (i = 0; i < str.length; i++) {
    chr   = str.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};
export const curry = (f) => {
  return (...arguments) => {
    if (arguments.length == f.length) {
      // If arguments passed is sufficient then return value = f(arguments)
      return (f.apply(null, arguments))
    }
    return curry(f.bind(null, ...arguments))
  }
}

// export const Unit = (depth, { ratio }) => {
//   const unit = 1 / depth;
//   const round = (value, { ratio = 1 } = {}) => Math.round(value * depth / ratio) / depth;
//   const inc = (value) => round(value + unit);
//   const dec = (value) => round(value - unit);
//   const convertFrom = curry((unit, value) => round(value * round.ratio, unit));
//   const convertTo = curry((unit, value) => unit(value * unit.ratio, round));
//   return Object.defineProperties(round, {
//     ratio: {value: ratio},
//     inc: {value: inc},
//     dec: {value: dec},
//     convertTo: {value: convertTo},
//     convertFrom: {value: convertFrom}
//   });
// };

export const Unit = (precision, { ratio, offset }) => {
  const unit = 1 / precision;
  const round = (value, depth) => Math.round(value * depth) / depth;
  const convert = ({ratio = 1, offset = 0}, value, direction = 1) => ratio ** direction * value + offset * direction;
  const create = (value, unit) => round(unit ? convert(create, convert(unit, value, -1)) : value, precision);
  const inc = (value) => round(value + unit);
  const dec = (value) => round(value - unit);
  const convertFrom = curry((unit, value) => create(value, unit));
  const convertTo = curry((unit, value) => unit(value, create));
  return Object.defineProperties(create, {
    ratio: {value: ratio},
    offset: {value: offset},
    round: {value: round},
    inc: {value: inc},
    dec: {value: dec},
    convertTo: {value: convertTo},
    convertFrom: {value: convertFrom}
  });
};

const mapOnionList = (acc, item) => new OnionList(fn(item), acc);
const filterOnionList = (acc, item) => fn(item) ? new OnionList(item, acc) : acc;
const reverseOnionList = (acc, item) => new OnionList(this.head, acc);
export class OnionList {
  constructor(head, tail){
    this.head = head;
    this.tail = tail;
    // this.length = this.tail != null ? this.tail.length + 1 : 0;
    Object.freeze(this)
  }
  add(item) {
    return new OnionList(item, this);
  }
  reduceRight(fn, acc) {
    acc = fn(acc, this.head);
    return this.tail != null
      ? this.tail.reduceRight(fn, acc)
      : acc
    ;
  }
  reduce(fn, acc) {
    return fn(
      this.tail != null ?
        this.tail.reduce(fn, acc)
        : acc
      , this.head
    );
  }
  map(fn) {
    return this.reduceRight(mapOnionList);
  }
  mapRight(fn) {
    return this.reduce(mapOnionList);
  }
  filter(fn) {
    return this.reduceRight(filterOnionList);
  }
  filterRight(fn) {
    return this.reduce(filterOnionList);
  }
  reverse() {
    return this.reduceRight(reverseOnionList);
  }
}
