import m from 'mithril';
import InputField from './InputField';
import UserList from './UserList';

const NotFound = {
  view: (vnode) => m('div', [
    m('p', 'Not found!!!!!!!'),
    m(InputField),
    m(UserList)
  ])
}

export default NotFound;
