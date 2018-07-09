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
import counter, { increment, decrement, setValue } from "./counterReduxModule";

const revertingActions = {
  INCREMENT: () => decrement(),
  DECREMENT: () => increment(),
  SET_COUNTER_VALUE: {
    action: (action, { val }) => setValue(val),
    createArgs: (state, action) => ({ val: state.counter })
  }
};
```

This configuration is supplied to a middleware registered with a reducer on the redux store.

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
