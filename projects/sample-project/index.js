import { r, Router } from 'mlib/router';
import m from 'mithril';
import Redux from 'redux';

// var script = document.createElement('script');
// script.src = "https://cdnjs.cloudflare.com/ajax/libs/redux/4.0.1/redux.js";
// document.getElementsByTagName('head')[0].appendChild(script);

const root = [
  r('/users', {
    resolve: ($) => !isUserLogged() ? $.redirect('/login') : $.continue(), // next(), return()
    onmatch: () => new Promise(
      (res, rej) => {
        setTimeout(res, 3000)
      }
    )
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

var store = Redux.createStore(counter)

var Template = {
  view: (vnode) => m(
    'div', [
      m('span#value', `${vnode.attrs.counter} times`),
      m('button#inc', {
        onclick: () => store.dispatch({ type: 'INCREMENT' })
      }, '+'),
      m('button#dec', {
        onclick: () => store.dispatch({ type: 'DECREMENT' })
      }, '-')
    ]
  )
}
function render() {
  m.render(document.body, m(Template, {counter: store.getState()}))
}
render()
store.subscribe(render)
