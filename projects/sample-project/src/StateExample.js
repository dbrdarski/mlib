import mlib from '../../../src';

const { CreateState } = mlib.State;

const { state, subscribe } = CreateState({
  a:1,
  b: 2,
  arr: [1,2,3]
});

window.state = state;
subscribe(
  ({ state }) => {
    console.log("RENDER!")
    document.body.innerHTML = `<pre>${JSON.stringify(state,null,'  ')}</pre>`
  }
);
