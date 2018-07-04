import { createStore, combineReducers, applyMiddleware } from "redux";
import thunk from "redux-thunk";
import {
  undoReducer as undoHistory,
  createUndoMiddleware,
  actions
} from "../src";
import counter, {
  INCREMENT,
  DECREMENT,
  increment,
  decrement,
  revertingActions
} from "./counterReduxModule";

describe("(Redux Module) Undo", () => {
  const { undo, redo, group } = actions;
  let store;
  beforeEach(() => {
    const initialState = {};
    const undoMiddleware = createUndoMiddleware({ revertingActions });
    store = createStore(
      combineReducers({ counter, undoHistory }),
      initialState,
      applyMiddleware(undoMiddleware, thunk)
    );
  });

  const checkCounter = value => expect(store.getState().counter).toEqual(value);

  const undoThenCheckCounter = value => {
    store.dispatch(undo());
    checkCounter(value);
  };

  const redoThenCheckCounter = value => {
    store.dispatch(redo());
    checkCounter(value);
  };

  it("should undo properly", () => {
    store.dispatch(increment());
    store.dispatch(increment());
    checkCounter(2);

    undoThenCheckCounter(1);
    undoThenCheckCounter(0);
  });

  it("should redo properly", () => {
    store.dispatch(increment());
    store.dispatch(increment());
    store.dispatch(undo());
    store.dispatch(undo());
    checkCounter(0);

    redoThenCheckCounter(1);
    redoThenCheckCounter(2);
  });

  it("should support unnecessary undos", () => {
    store.dispatch(increment());

    undoThenCheckCounter(0);
    undoThenCheckCounter(0);
    redoThenCheckCounter(1);
  });

  it("should support unnecessary redos", () => {
    store.dispatch(increment());
    store.dispatch(undo());

    redoThenCheckCounter(1);
    redoThenCheckCounter(1);
    undoThenCheckCounter(0);
  });

  it("should let undo and redo group of actions", () => {
    store.dispatch(increment());
    store.dispatch(
      group(dispatch => {
        dispatch(increment());
        dispatch(increment());
        dispatch(increment());
      })
    );
    store.dispatch(increment());
    store.dispatch(
      group(dispatch => {
        dispatch(increment());
        dispatch(increment());
      })
    );
    checkCounter(7);
    undoThenCheckCounter(5);
    undoThenCheckCounter(4);
    undoThenCheckCounter(1);
    undoThenCheckCounter(0);
    redoThenCheckCounter(1);
    redoThenCheckCounter(4);
    redoThenCheckCounter(5);
    redoThenCheckCounter(7);
  });

  it("should let undo and redo succesive group of actions", () => {
    store.dispatch(
      group(dispatch => {
        dispatch(increment());
        dispatch(increment());
        dispatch(increment());
      })
    );
    store.dispatch(
      group(dispatch => {
        dispatch(increment());
        dispatch(increment());
      })
    );
    checkCounter(5);

    undoThenCheckCounter(3);
    undoThenCheckCounter(0);
    redoThenCheckCounter(3);
    redoThenCheckCounter(5);
  });

  it("should let undo and redo nested group of actions", () => {
    store.dispatch(increment());
    store.dispatch(
      group(dispatch => {
        dispatch(increment());
        dispatch(
          group(dispatch2 => {
            dispatch2(increment());
            dispatch2(increment());
          })
        );
        dispatch(increment());
      })
    );
    checkCounter(5);

    store.dispatch(undo());
    checkCounter(1);

    store.dispatch(redo());
    checkCounter(5);
  });

  it("should not redo if another action have been done", () => {
    store.dispatch(increment());
    store.dispatch(increment());
    undoThenCheckCounter(1);
    undoThenCheckCounter(0);
    store.dispatch(increment());
    checkCounter(1);

    store.dispatch(redo());
    checkCounter(1);
    undoThenCheckCounter(0);
  });
});
