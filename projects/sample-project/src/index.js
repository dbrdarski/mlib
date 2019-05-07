import mlib from '../../../src';
import m from 'mithril';
// import Redux from 'redux';
import { logger, pipe } from '../../../src/Utils';
import Hello from './common/Hello';
import NotFound from './common/NotFound';
import { input } from './common/InputField';
import Counter from './Counter';
import { GameMap } from './OnionListExample';

const { Router, r } = mlib.Router;
// const Redux = require('redux');


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

const log = window.log = logger();

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

const Template = {
  view: (vnode) => m('div#app', vnode.children)
};

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

// @connect({ R, state, store })
// class App {
//   // console.log({ component, params, state })
//   view: () => {
//     const { component, params } = R.getRoute();
//     return m(component, {
//       counter: store.getState(),
//       params
//     });
//   };
// }

function render() {
  m.render( document.body, App() );
}

// function render() {
//   m.render( document.body, m(App));
// }
//

const R = Router(root, NotFound);

document.addEventListener('DOMContentLoaded', () => {
  input.subscribe(render);
  R.subscribe(render);
  store.subscribe(render);
  render();
  // sampleState.state.d = 4;
});
