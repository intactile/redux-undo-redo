# redux-undo-redo

An undo redo package for redux

[![Build Status](https://travis-ci.org/intactile/redux-undo-redo.svg?branch=master)](https://travis-ci.org/intactile/redux-undo-redo)
[![Maintainability](https://api.codeclimate.com/v1/badges/720449d047afa55671a9/maintainability)](https://codeclimate.com/github/intactile/redux-undo-redo/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/720449d047afa55671a9/test_coverage)](https://codeclimate.com/github/intactile/redux-undo-redo/test_coverage)

This package is heavily inspired by the [undo/redo package](https://github.com/PowToon/redux-undo-redo) developed by [PowToon](https://github.com/PowToon).

This package adds an undo redo history to a redux state.
For each undoable action, you have to provide its _reverting action_.
It supports also grouped actions which lets you undo a set of actions in one step.

## Installation

```bash
npm install @intactile/redux-undo-redo
```

or

```bash
yarn add @intactile/redux-undo-redo
```

## Configuration

This package is configured with a set of reverting actions:

```javascript
import counter, {
  increment,
  decrement,
  setValue,
  INCREMENT,
  DECREMENT,
  SET_COUNTER_VALUE
} from "./counterReduxModule";

const revertingActions = {
  [INCREMENT]: () => decrement(),
  [DECREMENT]: () => increment(),
  [SET_COUNTER_VALUE]: {
    action: (action, { val }) => setValue(val),
    createArgs: (state, action) => ({ val: state.counter })
  }
};
```

### Reverting actions

This is a map between the `action type` and it's reverting action creator, the action creator gets the original action and should return the reverting action.
If the the original action is not enough to create a reverting action you can provide `createArgs` that will result in an `args` argument for the reverting action:

```javascript
{
  action: (action, args) => revertingActionCreator(action.something, args.somethingElse),
  createArgs: (state, action) => ({somethingElse: state.something}),
  groupWithPrevious: (action, previousAction) => action.type === previousAction.type
}
```

the `createArgs` function runs _before_ the action happens and collects information needed to revert the action.
you get this as a second argument for the reverting action creator.
the optional `groupWithPrevious` function allows to group an action with the previous one.

### Middleware and reducer

These reverting actions are supplied to a middleware registered with a reducer on the redux store.

```javascript
import { createStore, combineReducers, applyMiddleware } from "redux";
import {
  createUndoReducer,
  createUndoMiddleware
} from "@intactile/redux-undo-redo";

const undoMiddleware = createUndoMiddleware({ revertingActions });
const undoHistory = : createUndoReducer();
const store = createStore(
  combineReducers({ counter, undoHistory }), // add the reducer
  initialState,
  applyMiddleware(thunk) // add the middleware
);
```

### History size

The undo and the redo histories are limited to respectively 50 and 10 by default.
They can be increased or decreased when the reducer is created:

```javascript
const undoHistory = createUndoReducer({
  undoHistorySize: 200,
  redoHistorySize: 100
});
```

## Usage

### Undo/redo actions

```javascript
import { actions, selectors } from "@intactile/redux-undo-redo";
import { increment, decrement, setValue } from "./counterReduxModule";

store.dispatch(increment()); // counter = 1
store.dispatch(increment()); // counter = 2
console.log(selectors.canUndo(store.getState())); // true

store.dispatch(actions.undo()); // counter = 1
console.log(selectors.canRedo(store.getState())); // true

store.dispatch(actions.redo()); // counter = 2
```

### Undo/redo group of actions

```javascript
store.dispatch(actions.group(increment(), increment(), increment())); // counter = 3

store.dispatch(actions.undo()); // counter = 0
store.dispatch(actions.redo()); // counter = 3
```

### Undo/redo group of actions with redux-thunk

```javascript
store.dispatch(
  actions.group(dispatch => {
    dispatch(increment());
    dispatch(increment());
    dispatch(increment());
  })
); // counter = 3

store.dispatch(actions.undo()); // counter = 0
store.dispatch(actions.redo()); // counter = 3
```

### Group automatically successive actions

It is possible to group an action with the previous one.
The reverting action should be configured with a new function.

```javascript
[ADD_VALUE]: {
  action: action => removeValue(action.payload),
  groupWithPrevious: (action, previousAction) => action.type === previousAction.type
}
```

If the previous action have the same type, the actions will be automatically grouped.

```javascript
store.dispatch(addValue(1)); // counter = 1
store.dispatch(addValue(2)); // counter = 3
store.dispatch(addValue(3)); // counter = 6

store.dispatch(actions.undo()); // counter = 0
store.dispatch(actions.redo()); // counter = 6
```

### Pause/resume the undo/redo actions

```javascript
store.dispatch(increment()); // counter = 1
store.dispatch(increment()); // counter = 2
store.dispatch(actions.pause());
console.log(selectors.canUndo(store.getState())); // false

store.dispatch(actions.undo()); // counter = 2

store.dispatch(actions.resume());
console.log(selectors.canRedo(store.getState())); // true

store.dispatch(actions.undo()); // counter = 1
```
