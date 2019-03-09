import mlib from '../../../src';
import m from 'mithril';
// import Redux from 'redux';

const { Router, r } = mlib.Router;
const { CreateState, CreateProxy } = mlib.State;
const Redux = require('redux');

// var script = document.createElement('script');
// script.src = "https://cdnjs.cloudflare.com/ajax/libs/redux/4.0.1/redux.js";
// document.getElementsByTagName('head')[0].appendChild(script);

// R.go('/users/dane');

function counter(state, action) {
  if (typeof state === 'undefined') {
    return 0
  }
  switch (action.type) {
    case 'INCREMENT':
      return state + 1
    case 'DECREMENT':
      return state - 1
    default:
      return state
  }
}

const store = Redux.createStore(counter)

const Link = {
  view: ({attrs: {to, onclick, ...attrs }, children}) => m('a', {
    ...attrs,
    href: to,
    onclick: (e) => {
      onclick && onclick(e);
      e.preventDefault();
      R.match(to);
    }
  }, children)
}

const users = {
  dane: "Dane",
  nom: 'Naumche'
}

const sayHi = (key) => m(Link, {to: `/users/${key}`}, `Say hi to ${users[key]}!`);

let input = CreateState({
  value: ''
});



const InputField = {
  view: () => {
    console.log("value", input.state.value)
    return m('input[type="text"]', {
      value: input.state.value,
      oninput: (e) => input.state.value = e.target.value
    })
  }
}

const Template = {
  view: (vnode) => m('div#app', vnode.children)
};
const UserList = {
  view: () => m('nav', [
    sayHi('dane'),
    sayHi('nom')
  ])
}
const NotFound = {
  view: () => m('div', [
    m('p', 'Not found!!!!!!!'),
    m(InputField),
    m('button', {
      onclick: () => R.go(input.state.value)
    }, 'Go!!!!'),
    m(UserList)
  ])
}

// const Connector.
// const connect = (connectorFn) => (component) => m(component, )

const Hello = {
  view: (vnode) => m('div', [
    m('p', `Hello, ${users[vnode.attrs.params.id]}!!!`),
    m(UserList)
  ])
}
const Counter = {
  view: (vnode) => m(
    'nav', [
      m('span#value', `${vnode.attrs.counter} times`),
      m('button#inc', {
        onclick: () => store.dispatch({ type: 'INCREMENT' })
      }, '+'),
      m('button#dec', {
        onclick: () => store.dispatch({ type: 'DECREMENT' })
      }, '-'),
      m(UserList)
    ]
  )
}

const root = [
  r('/users', {
    // resolve: ($) => !isUserLogged() ? $.redirect('/login') : $.continue(), // next(), return()
    onmatch: () => new Promise(
      (res, rej) => {
        setTimeout(res, 500)
      }
    )
  }, [
    r('/', Counter),
    r('/:id', Hello),
    r('/:id/:filter', Hello),
    r('/:userId', [
      r('/posts/:postId', Hello),
      r('/photos/:imageId', Hello)
    ])
  ]),
  r('/', {
    view: () => 'Hello'
  })
];
// var App = {
//   view: m(Router)
// }
const App = () => {
  const { component, params } = R.getRoute();
  const state = store.getState();
  console.log({ component, params, state })
  return m(component, {
    params,
    counter: state
  });
};

// const Router = {
//   view: () => {
//     const { component, params } = R.getRoute();
//     return m(component, { params });
//   }
// };

// const App = () => <Router />

// const connector = (fn) => {
//   var connector = {};
//   var listeners = [];
//   const renderF = (dom, node) => (data)
//   return {
//     add: (prop, o) => {
//       Object.defineProperty(connector, prop, {
//         get: o.getState
//       });
//       listeners.push(o);
//     },
//     mount: (dom) => {
//       listeners.map( v => v.subscribe(render))
//     }
//   }
// }
//
// connector.add('store', store);
// connector.add('router', R);

function render() {
  m.render( document.body, App() );
}

const R = Router(root, NotFound);

document.addEventListener('DOMContentLoaded',() => {
  input.subscribe(render);
  R.subscribe(render);
  store.subscribe(render);
  render();
  // sampleState.state.d = 4;
});
