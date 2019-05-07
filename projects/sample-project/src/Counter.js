const Redux = require('redux');

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

export const store = Redux.createStore(counter)

export const Counter = {
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
