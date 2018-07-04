export const INCREMENT = 'INCREMENT';
export const DECREMENT = 'DECREMENT';

export const increment = () => ({
  type: INCREMENT
});
export const decrement = () => ({
  type: DECREMENT
});

export default function testReducer(state = 0, action) {
  if (action.type === INCREMENT) {
    return state + 1;
  } else if (action.type === DECREMENT) {
    return state - 1;
  }
  return state;
}
