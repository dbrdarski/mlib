var once = require('./once');
var createInstance = require('./create-instance');

var createStore = function(container){
  return function(name, settings){
    var store = Object.defineProperty({}, '$resolve', {
      writable: false,
      value: function(){
        var modules = arguments.length ? arguments : Object.keys(store);
        modules.forEach(function(key){
          store[key];
        });
      }
    });
    var storeKeys = {};
    var storeGetter = storeKeys[settings && settings.plural || (name + 's')] = {get: function(){ return createInstance(store, this.$scope)}};
    var storeSetter = storeKeys[name] = {
      value: function(moduleName, module){
        var instance = createInstance(container, {
          name: moduleName,
          type: name,
          module: module
        });
        var resolve = once(module.bind(null, instance))
        Object.defineProperty(store, moduleName, {
          get: function(){
            console.log('====GETTER====')
            console.log(moduleName)
            console.log("Deps for " + this.$scope.name+ ', checked by ' + instance.$scope.name + ', non-recursive (shallow)!')
            var hasDep = this.$scope.getDeps(this.$scope, instance.$scope)
            console.log('====HAS DEP====')
            console.log({hasDep});
            console.log('====ADD DEP====')
            console.log(this.$scope.name + ' gets ' + instance.$scope.name);
            hasDep && hasDep.match || this.$scope.deps.push(instance.$scope);

            console.log("Deps for " + instance.$scope.name+ ', checked by ' + this.$scope.name + ', deep recursive!')
            var circular = instance.$scope.getDeps(instance.$scope, this.$scope, true);
            console.log('====IS CIRCULAR?====')
            console.log({
              circular: circular,
              caller: this.$scope,
              getter: instance.$scope
            });
            if (circular && circular.match) {
              console.log('====IS CIRCULAR?====')
              circular = instance.$scope.getDeps(instance.$scope, this.$scope, true);
              console.log({...circular, str: circular.stack.map((x) => x.type+': '+x.name).join('=>')})
              throw new Error(["You have circular dependency between",circular.dep.type,"'"+circular.dep.name+"'",'and',circular.parent.type,"'"+circular.parent.name+"'"].join(" "))
            }
            return resolve();
          },
          enumberable: true
        })
        return container;
      }
    };
    Object.defineProperties(container, storeKeys)
  }
}

module.exports = createStore;
