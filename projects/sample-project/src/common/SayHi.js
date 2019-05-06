import m from 'mithril';

const sayHi = (key) => m(Link, {to: `/users/${key}`}, `Say hi to ${users[key]}!`);

export default sayHi;
