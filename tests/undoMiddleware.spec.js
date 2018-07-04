import configureStore from "redux-mock-store";
import createUndoMiddleware from "../src/createUndoMiddleware";
import { addUndoItem, undo, redo } from "../src/undoReduxModule";
import {
  setValue,
  increment,
  decrement,
  revertingActions
} from "./counterReduxModule";

const initialState = {
  counter: 4,
  viewState: true
};

const notUndoableAction = () => ({ type: "NOT_UNDOABLE" });
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

    expect(store.getActions()).toEqual([action, addUndoItem(action)]);
  });

  it("doesn't dispatch UNDO_HISTORY@ADD for un-supported actions", function() {
    const store = mockStore(initialState);
    const action = notUndoableAction();
    store.dispatch(action);

    expect(store.getActions()).toEqual([action]);
  });

  it("dispatches UNDO_HISTORY@ADD for supported actions with args", function() {
    const store = mockStore(initialState);
    const action = setValue(7);
    store.dispatch(action);

    expect(store.getActions()).toEqual([
      action,
      addUndoItem(action, { val: initialState.counter })
    ]);
  });

  it("dispatches UNDO_HISTORY@ADD with view states", function() {
    const store = mockStore(initialState);
    const action = setValue(7);
    store.dispatch(action);

    expect(store.getActions()).toEqual([
      action,
      addUndoItem(action, { val: initialState.counter })
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
      store.dispatch(undo());

      expect(store.getActions()).toEqual([undo(), decrement()]);
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
      store.dispatch(redo());

      expect(store.getActions()).toEqual([redo(), increment()]);
    });
  });
});
