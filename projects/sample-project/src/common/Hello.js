import m from 'mithril';
import UserList from './UserList';

const users = {
  dane: "Dane",
  nom: 'Naumche'
}

const Hello = {
  view: (vnode) => m('div', [
    m('p', `Hello, ${users[vnode.attrs.params.id]}!!!`),
    m(UserList)
  ])
}

export default Hello;
