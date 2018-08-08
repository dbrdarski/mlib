var createInstance = function(container, values) {
  return Object.defineProperty(Object.create(container), '$scope', {
    writable: false,
    value: {
      name: values.name,
      type: values.type,
      module: values.module,
      deps: values.deps || [],
      getDeps: function getDeps(module, instance, deep){
        console.log('====GET DEPS====')
        console.log({module, caller: instance})
        return module.deps.reduce(function reduceFn(acc, dep){
          console.log('====REDUCE DEPS====')
          console.log({acc, dep})
          var result = acc.match || acc.stack.reduce((acc, i) => {
            console.log('====REDUCE STACK====')
            console.log({match: acc, dep})
            return acc || i.module === dep.module && i
          }, false);
          return result ? {
            match: true,
            parent: acc.parent,
            parentName: acc.parent.name,
            dep: result,
            depName: result.name,
            stack: acc.stack,
            stackNames: acc.stack.map( x => x.name )
          } : deep ?
            dep.deps.reduce(reduceFn, {
              match: false,
              parent: dep,
              parentName: dep.name,
              stack: acc.stack.concat(dep),
              stackNames: acc.stack.concat(dep).map( x => x.name )
            }) : {match: false};
        }, {
          match: false,
          stack: [instance],
          stackNames: [instance.name],
          parent: instance,
          parentName: instance.name
        })
      }
    }
  });
}

module.exports = createInstance;
