var createStore = require('./src/create-store');
var createInstance = require('./src/create-instance');

var container = (
  function(container, instance){
    return instance = createInstance(Object.defineProperties(container, {
      define: {
        writable: false,
        value: function(name, value){
          if(value == null && typeof name === 'object'){
            Object.defineProperties(container, Object.entries(name).reduce(function(acc, i){
              acc[i[0]] = { value: acc[i[1]], writable: false };
              return acc;
            }, {}));
          } else {
            Object.defineProperty(container, name, {value, writable: false})
            return container;
          }
        }
      },
      run: {
        writable: false,
        value: {
          function(mainModule){
            scope.module = mainModule;
            mainModule(instance);
            return container;
          }
        }
      },
      createStore: {
        writable: false,
        value: createStore(container)
      }
    }), {
      name: 'app',
      type: 'container'
    });
  }({})
);

container.createStore('module');
module.exports = container;
