const isUserLogged = (asd = {redirect: () => 1 }) => 1;

function Match(){
  Object.defineProperties(this, {
    matched: false,
    routes: [],
    params
  });
}

function Request(path){
  return {
    path,
    segment: path,
    routes: [],
    params: {},
    match: false
  }
}

const route2regex = (route, isGroup) => {
    let regex;
    if (route === "/"){
      route = '';
    }
    const params = route.match(/:[\w][\w\d]*/g)
    if(params && params.length){
       regex = route.replace(
         RegExp(params.join("|"), 'g'), 
         "([^/#?]+)"
       )
    } else {
        regex = route
    }
  return {
    params: params && params.map(p => p.slice(1)),
    regex: RegExp(`^${regex}${isGroup?'':'$'}`)
  }
}

const r = function(...args){
  const content = args.pop();
  const [ route, options ] = args;
  const isGroup = Array.isArray(content);
  console.log({route, isGroup});
  const { params, regex } = route2regex(route, isGroup)
  return {
    route,
    params,
    options,
    regex,
    [isGroup ? 'children':'component']: content
  }
};

const matchRoutes = (routes, req) => routes.reduce(
  (req, route) => {
    if(req.match){
        return req
    }
    const match = req.segment.match(route.regex);
    if(match){
      req.match = {route, result: match};
      const hasParams = match.length > 1;
      let params;
      if(hasParams){
        params = {};
        match.slice(1).forEach((value, key) => {
          params[route.params[key]] = value;
          Object.defineProperty(req.params, route.params[key], {value})
        })
      }
    }
    return req;
  }, req
)

// var define = (o, prop, value) => Object.defineProperty(o, prop, {
//  value
// })

var resolve = (routes, req) => {
  req = matchRoutes(routes, req);
  const match = req.match;
  console.log({req});
  if(match && match.route.children){
    const route = match.route;    
    req.match = false;
    req.routes.push(route);
    req.segment = req.segment.replace(route.regex, "")
    return resolve(route.children, req)
  }
  return req;
}

// const routes = r('/', )

const Router = (routes) => ({
    go: (path) => resolve(routes, Request(path))
})

const root = [
  r('/users', {
    resolve: (req) => isUserLogged() ? req.redirect('signup') : req 
  }, [
    r('/', {}),
    r('/:id', {}),
    r('/:id/:filter', {}),
    r('/:userId', [
      r('/posts/:postId', {}),
      r('/photos/:imageId', {})    
    ])
  ])
];

const R = Router(root);

// let req = {
//   path: '/users/123?show=true',
//   url: '/users/123',
//   query: {
//      show: true
//   }
// }

// const RNodeProto = {

// };

// function RouteNode (){
//  this.type = "RouteNode";
// }
// RouteNode.prototype = Object.create(RNodeProto);

// function GroupNode (){
//  this.type = "RouteNode";
// }
// GroupNode.prototype = Object.create(RNodeProto);

Router
  .match(routes)
  .catch(NotFound);