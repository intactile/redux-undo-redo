import { createActionCreator } from '@intactile/redux-utils';

export const INCREMENT = 'INCREMENT';
export const DECREMENT = 'DECREMENT';
export const SET_VALUE = 'SET_VALUE';
export const MULTIPLY_VALUE = 'MULTIPLY_VALUE';
export const DIVIDE_VALUE = 'DIVIDE_VALUE';
export const ADD_VALUE = 'ADD_VALUE';
export const REMOVE_VALUE = 'REMOVE_VALUE';

export const increment = createActionCreator(INCREMENT);
export const decrement = createActionCreator(DECREMENT);

export const setValue = createActionCreator(SET_VALUE);

export const multiplyValue = createActionCreator(MULTIPLY_VALUE);

export const divideValue = createActionCreator(DIVIDE_VALUE);

export const addValue = createActionCreator(ADD_VALUE);

export const removeValue = createActionCreator(REMOVE_VALUE);

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
  },
  [ADD_VALUE]: {
    action: action => removeValue(action.payload),
    groupWithPrevious: (action, previousAction) => action.type === previousAction.type
  },
  [REMOVE_VALUE]: {
    action: action => addValue(action.payload),
    groupWithPrevious: (action, previousAction) => action.type === previousAction.type
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
  },
  [ADD_VALUE](state, action) {
    return state + action.payload;
  },
  [REMOVE_VALUE](state, action) {
    return state - action.payload;
  }
};
export default function testReducer(state = 0, action) {
  const reducer = caseReducers[action.type];
  if (reducer) {
    return reducer(state, action);
  }
  return state;
}
