import configureStore from "redux-mock-store";
import { createUndoMiddleware, actions as undoActions } from "../src";

const initialState = {
  counter: 4,
  viewState: true
};

const increment = () => ({ type: "INCREMENT" });
const decrement = () => ({ type: "DECREMENT" });
const setCounterVal = viewState => ({ type: "SET_COUNTER_VAL", viewState });
const notUndoableAction = () => ({ type: "NOT_UNDOABLE" });
const revertingActions = {
  INCREMENT: () => decrement(),
  DECREMENT: () => increment(),
  SET_COUNTER_VAL: {
    action: (action, { val }) => setCounterVal(val),
    createArgs: (state, action) => ({ val: state.counter })
  }
};
const undoMiddleware = createUndoMiddleware({
  revertingActions
});
const mockStore = configureStore([undoMiddleware]);

const undoMiddlewareWithoutViewState = createUndoMiddleware({
  revertingActions
});
const mockStoreWithoutViewState = configureStore([
  undoMiddlewareWithoutViewState
]);

describe("undoMiddleware", function() {
  test("dispatches UNDO_HISTORY@ADD for supported actions", function() {
    const store = mockStore(initialState);
    const action = increment();
    store.dispatch(action);

    expect(store.getActions()).toEqual([
      action,
      undoActions.addUndoItem(action)
    ]);
  });

  it("doesn't dispatch UNDO_HISTORY@ADD for un-supported actions", function() {
    const store = mockStore(initialState);
    const action = notUndoableAction();
    store.dispatch(action);

    expect(store.getActions()).toEqual([action]);
  });

  it("dispatches UNDO_HISTORY@ADD for supported actions with args", function() {
    const store = mockStore(initialState);
    const action = setCounterVal(7);
    store.dispatch(action);

    expect(store.getActions()).toEqual([
      action,
      undoActions.addUndoItem(action, { val: initialState.counter })
    ]);
  });

  it("dispatches UNDO_HISTORY@ADD with view states", function() {
    const store = mockStore(initialState);
    const action = setCounterVal(7);
    store.dispatch(action);

    expect(store.getActions()).toEqual([
      action,
      undoActions.addUndoItem(action, { val: initialState.counter })
    ]);
  });

  describe("UNDO_HISTORY@UNDO", function() {
    it("dispatches the reverting action", function() {
      const store = mockStoreWithoutViewState({
        counter: 4,
        viewState: true,
        undoHistory: {
          undoQueue: [
            {
              action: increment(),
              beforeState: undefined,
              afterState: undefined,
              args: undefined
            }
          ],
          redoQueue: []
        }
      });
      store.dispatch(undoActions.undo());

      expect(store.getActions()).toEqual([undoActions.undo(), decrement()]);
    });
  });

  describe("UNDO_HISTORY@REDO", function() {
    it("dispatches the original action", function() {
      const store = mockStoreWithoutViewState({
        counter: 4,
        viewState: true,
        undoHistory: {
          undoQueue: [],
          redoQueue: [
            {
              action: increment(),
              args: undefined
            }
          ]
        }
      });
      store.dispatch(undoActions.redo());

      expect(store.getActions()).toEqual([undoActions.redo(), increment()]);
    });
  });
});
