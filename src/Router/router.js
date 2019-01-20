class Request{
  constructor(path){
    this.path = path;
    this.segment = path;
    this.routes = [];
    this.params = {};
    this.match = false;
  }
  // get segment(){
  //   return !this.routes.length
  //     ? this.path
  //     : this.routes.path
  // }
  updateSegment(matchedSegment){
    this.segment = this.segment.replace(matchedSegment, "")
    return this;
  }
  addParam(key, value){
    Object.defineProperty(this.params, key, { value });
    return this;
  }
  resolve(route){
    this.match = route;
    Object.freeze(this);
    return this;
  }
}
const route2regex = (pattern, isGroup) => {
    let regex;
    if (pattern === "/"){
      pattern = '';
    }
    const params = pattern.match(/:[\w][\w\d]*/g)
    if(params && params.length){
       regex = pattern.replace(
         RegExp(params.join("|"), 'g'),
         "([^/#?]+)"
       )
    } else {
        regex = pattern
    }
  return {
    params: params && params.map(p => p.slice(1)),
    regex: RegExp(`^${regex}${isGroup?'':'$'}`)
  }
}

export const r = function(...args){
  const content = args.pop();
  const [ route, options ] = args;
  const isGroup = Array.isArray(content);
  const { params, regex } = route2regex(route, isGroup)
  return {
    route,
    options,
    [isGroup ? 'children':'component']: content,
    regex,
    params
  }
};
const matchRoutes = (routes, segment) => {
  let match, route;
  for ( let i = 0; i < routes.length; i++) {
    route = routes[i];
    match = segment.match(route.regex);
    if(match){
      return {route, result: match};
    }
  }
  return false;
}
const processParams = (match, req) => {
  const hasParams = match.result.length > 1;
  let matchedParams;
  if(hasParams){
    match.result.slice(1).forEach((value, key) => {
      req.addParam(match.route.params[key], value)
    })
  }
  return matchedParams;
}
const resolve = (routes, req) => {
  const match = matchRoutes(routes, req.segment);
  if(match) {
    processParams(match, req);
    let onmatch = match.route.options && match.route.options.onmatch;
    onmatch = onmatch && onmatch();
    req.routes.push(match.route);
    if (match.route.children) {
      req.updateSegment(match.route.regex);
      const nested = resolve(match.route.children, req);
      return Promise.all([nested, onmatch]).then(([req]) => req)
    } else {
      return Promise.resolve(req.resolve(match.route));
    }
  }
  return Promise.reject({ match: false });
}
export const Router = (routes) => ({
    match: (path) => resolve(routes, new Request(path))
      .then((req) => {
        console.log(req);
        window.history.pushState({}, '', req.path);
      })
      .catch((error) => console.log({error}))
})
