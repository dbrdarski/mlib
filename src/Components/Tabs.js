import m from 'mithril';

const Tab = {
  view: (vnode) => m('.ux-tabs', [
    m('.ux-tab-list', [
      vnode.attrs.render();
    ]),
    m('.ux-tab-contents'), [
      vnode.attrs.render();
    ];
  ])
}
