import { createStore, combineReducers, applyMiddleware } from "redux";
import thunk from "redux-thunk";
import {
  undoReducer as undoHistory,
  createUndoMiddleware,
  actions,
  selectors
} from "../src";
import counter, {
  increment,
  setValue,
  multiplyValue,
  revertingActions
} from "./counterReduxModule";

describe("(Redux Module) Undo", () => {
  const { undo, redo, group, clearHistory } = actions;
  const { canUndo, canRedo } = selectors;
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
  const checkCanUndo = can => expect(canUndo(store.getState())).toEqual(can);
  const checkCanRedo = can => expect(canRedo(store.getState())).toEqual(can);

  const undoThenCheckCounter = value => {
    store.dispatch(undo());
    checkCounter(value);
  };

  const redoThenCheckCounter = value => {
    store.dispatch(redo());
    checkCounter(value);
  };

  const repeat10Times = callback => {
    for (let index = 0; index < 5; index++) {
      callback();
    }
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

  it("should not redo if the history have been cleared", () => {
    store.dispatch(increment());
    store.dispatch(increment());
    checkCounter(2);
    store.dispatch(clearHistory());
    undoThenCheckCounter(2);
  });

  it("should undo/redo in the correct order", () => {
    store.dispatch(setValue(10));
    store.dispatch(setValue(5));
    store.dispatch(setValue(1));
    checkCounter(1);
    // console.log(JSON.stringify(store.getState().undoHistory, null, 2));

    repeat10Times(() => {
      undoThenCheckCounter(5);
      undoThenCheckCounter(10);
      undoThenCheckCounter(0);
      redoThenCheckCounter(10);
      redoThenCheckCounter(5);
      redoThenCheckCounter(1);
    });
  });

  it("should undo/redo groups in the correct order", () => {
    store.dispatch(
      group(dispatch => {
        dispatch(setValue(3));
        dispatch(multiplyValue(3));
      })
    );
    checkCounter(9);
    store.dispatch(
      group(dispatch => {
        dispatch(increment());
        dispatch(multiplyValue(2));
      })
    );

    repeat10Times(() => {
      checkCounter(20);
      undoThenCheckCounter(9);
      undoThenCheckCounter(0);
      redoThenCheckCounter(9);
      redoThenCheckCounter(20);
    });
  });

  it("should tells if undo or redo are possible", () => {
    checkCanUndo(false);
    checkCanRedo(false);

    store.dispatch(increment());
    checkCanUndo(true);
    checkCanRedo(false);

    store.dispatch(increment());
    checkCanUndo(true);
    checkCanRedo(false);

    store.dispatch(undo());
    checkCanUndo(true);
    checkCanRedo(true);

    store.dispatch(undo());
    checkCanUndo(false);
    checkCanRedo(true);

    store.dispatch(redo());
    checkCanUndo(true);
    checkCanRedo(true);

    store.dispatch(redo());
    checkCanUndo(true);
    checkCanRedo(false);
  });
});
