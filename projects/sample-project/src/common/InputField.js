import m from 'mithril';
import mlib from '../../../../src';

const { CreateState } = mlib.State;

export const input = CreateState({
  value: ''
});

export const InputField = {
  view: () => {
    // console.log("value", input.state.value)
    return m('input[type="text"]', {
      value: input.state.value,
      oninput: (e) => input.state.value = e.target.value
    })
  }
}
