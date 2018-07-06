export const INCREMENT = 'INCREMENT';
export const DECREMENT = 'DECREMENT';
export const SET_VALUE = 'SET_VALUE';
export const MULTIPLY_VALUE = 'MULTIPLY_VALUE';
export const DIVIDE_VALUE = 'DIVIDE_VALUE';

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

export const multiplyValue = value => ({
  type: MULTIPLY_VALUE,
  payload: value
});

export const divideValue = value => ({
  type: DIVIDE_VALUE,
  payload: value
});

export const revertingActions = {
  [INCREMENT]: () => decrement(),
  [DECREMENT]: () => increment(),
  [SET_VALUE]: {
    action: (action, { val }) => setValue(val),
    createArgs: state => ({ val: state.counter })
  },
  [MULTIPLY_VALUE]: {
    action: action => divideValue(action.payload),
    createArgs: state => ({ val: state.counter })
  }
};

const caseReducers = {
  [INCREMENT](state) {
    return state + 1;
  },
  [DECREMENT](state) {
    return state - 1;
  },
  [MULTIPLY_VALUE](state, action) {
    return state * action.payload;
  },
  [DIVIDE_VALUE](state, action) {
    return state / action.payload;
  },
  [SET_VALUE](state, action) {
    return action.payload;
  }
};
export default function testReducer(state = 0, action) {
  const reducer = caseReducers[action.type];
  if (reducer) {
    return reducer(state, action);
  }
  return state;
}
