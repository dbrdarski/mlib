import mlib from '../../../src';
import m from 'mithril';
// import Redux from 'redux';
import { logger, pipe } from '../../../src/Utils';

const { Router, r } = mlib.Router;
const { CreateState } = mlib.State;
const Redux = require('redux');

const log = window.log = logger();

const { state, subscribe } = CreateState({
  a:1,
  b: 2,
  arr: [1,2,3]
});

window.state = state;
subscribe(
  ({ state }) => {
    document.body.innerHTML = `<pre>${JSON.stringify(state)}</pre>`
  }
);

// window.CreateState = CreateState;
//
// // window.s1 = state()
// // state.arr.push(13)
// // window.s2 = state()
// state( s => s.arr.push(101,102,103))
// window.s3 = state()
// state({d: 4, e: {f: 5}});
// window.s4 = state()
// let sampleState = window.sampleState = CreateState({
//   a: 1,
//   b: 2,
//   c: {
//     d: {
//       e: 3
//     }
//   },
//   arr: [1, 2, 3, 4, 5, 6]
// });
//
// sampleState.subscribe(console.log);
//
// var script = document.createElement('script');
// script.src = "https://cdnjs.cloudflare.com/ajax/libs/redux/4.0.1/redux.js";
// document.getElementsByTagName('head')[0].appendChild(script);

// R.go('/users/dane');
// require { Component } from 'mlib';
//
// Component('Link', ({
//
// }) => class Link {
//
//   view(){
//     return (
//
//     );
//   }
// })

// export default ({ state, store }) => ({
//   view() {
//
//   }
// });
//
// connect({
//   localState,
//   store
// }, Component)

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
    // console.log("value", input.state.value)
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
  view: (vnode) => m('div', [
    m('p', 'Not found!!!!!!!'),
    m(InputField),
    m(UserList)
  ])
}
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
  // console.log({ component, params, state })
  return m(component, {
    params,
    counter: state
  });
};

function render() {
  m.render( document.body, App() );
}

const R = Router(root, NotFound);

document.addEventListener('DOMContentLoaded', () => {
  input.subscribe(render);
  R.subscribe(render);
  store.subscribe(render);
  render();
  // sampleState.state.d = 4;
});
