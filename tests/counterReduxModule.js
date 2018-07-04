export const INCREMENT = "INCREMENT";
export const DECREMENT = "DECREMENT";
export const SET_VALUE = "SET_VALUE";

export const increment = () => ({
  type: INCREMENT
});
export const decrement = () => ({
  type: DECREMENT
});

export const setValue = value => ({
  type: SET_VALUE,
  payload: value
});

export const revertingActions = {
  [INCREMENT]: () => decrement(),
  [DECREMENT]: () => increment(),
  SET_VALUE: {
    action: (action, { val }) => setValue(val),
    createArgs: (state, action) => ({ val: state.counter })
  }
};

export default function testReducer(state = 0, action) {
  if (action.type === INCREMENT) {
    return state + 1;
  } else if (action.type === DECREMENT) {
    return state - 1;
  } else if (action.type === SET_VALUE) {
    return (state = action.value);
  }
  return state;
}
