import { r, Router } from 'mlib/router';
import m from 'mithril';
import Redux from 'redux';

var script = document.createElement('script');
script.src = "https://cdnjs.cloudflare.com/ajax/libs/redux/4.0.1/redux.js";
document.getElementsByTagName('head')[0].appendChild(script);


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

var Link = {
  view: ({attrs: {to, onclick, ...attrs }, children}) => m('a', {
    ...attrs,
    href: to,
    onclick: (e) => {
      onclick && onclick(e);
      e.preventDefault();
      window.history.pushState({}, '', to);
    }
  }, children)
}
const users = {
  dane: "Dane",
  nom: 'Naumche'
}

const sayHi = (key) => m(Link, {to: `/users/${key}`}, `Say hi to ${users[key]}!`);

var Template = {
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
    m(UserList)
  ])
}
const Hello = {
  view: (vnode) => m('div', [
    m('p', `Hello, ${users[vnode.attrs.params.id]}!!!`),
    m(UserList)
  ])
}
var Counter = {
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
    // onmatch: () => new Promise(
    //   (res, rej) => {
    //     setTimeout(res, 500)
    //   }
    // )
  }, [
    r('/', Counter),
    r('/:id', Hello),
    r('/:id/:filter', Hello),
    r('/:userId', [
      r('/posts/:postId', Hello),
      r('/photos/:imageId', Hello)
    ])
  ])
];
// var App = {
//   view: m(Router)
// }
const App = () => {
  const { component, params } = R.getRoute();
  const state = store.getState();
  console.log({ component, params, state })
  return m(
    Template,
    m(component, {
      params,
      counter: state
    })
  );
};


function render() {
  m.render( document.body, App() );
}

const R = Router(root, NotFound);
R.subscribe(render);
store.subscribe(render);
