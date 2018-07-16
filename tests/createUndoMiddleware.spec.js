import configureStore from 'redux-mock-store';
import createUndoMiddleware from '../src/createUndoMiddleware';
import { addUndoItem, undo, redo, group, beginGroup, endGroup } from '../src/actions';
import { setValue, increment, decrement, revertingActions, addValue } from './counterReduxModule';

const initialState = {
  counter: 4,
  undoHistory: {
    undoQueue: [],
    redoQueue: []
  }
};

const notUndoableAction = () => ({ type: 'NOT_UNDOABLE' });
const undoMiddleware = createUndoMiddleware({
  revertingActions
});
const mockStore = configureStore([undoMiddleware]);

describe('undoMiddleware', () => {
  const createStateWithOneUndoItem = undoItem => ({
    counter: 4,
    undoHistory: {
      undoQueue: [[undoItem]],
      redoQueue: []
    }
  });
  const createStateWithOnRedoItem = redoItem => ({
    counter: 4,
    undoHistory: {
      undoQueue: [],
      redoQueue: [[redoItem]]
    }
  });

  it('dispatches ADD for supported actions', () => {
    const store = mockStore(initialState);
    const action = increment();
    store.dispatch(action);

    expect(store.getActions()).toEqual([action, addUndoItem(action)]);
  });

  it('dispatches ADD for supported actions with groupWithPrevious without previous action', () => {
    const store = mockStore(initialState);
    const action = addValue(10);
    store.dispatch(action);

    expect(store.getActions()).toEqual([action, addUndoItem(action)]);
  });

  it('dispatches ADD for supported actions with groupWithPrevious with a previous action', () => {
    const store = mockStore(
      createStateWithOneUndoItem({
        action: addValue(5),
        args: undefined
      })
    );
    const action = addValue(10);
    store.dispatch(action);

    expect(store.getActions()).toEqual([action, addUndoItem(action, undefined, true)]);
  });

  it('dispatches ADD for supported actions with groupWithPrevious with another previous action', () => {
    const store = mockStore(
      createStateWithOneUndoItem({
        action: increment(),
        args: undefined
      })
    );
    const action = addValue(10);
    store.dispatch(action);

    expect(store.getActions()).toEqual([action, addUndoItem(action, undefined, false)]);
  });

  it('does not dispatch ADD for un-supported actions', () => {
    const store = mockStore(initialState);
    const action = notUndoableAction();
    store.dispatch(action);

    expect(store.getActions()).toEqual([action]);
  });

  it('dispatches ADD for supported actions with args', () => {
    const store = mockStore(initialState);
    const action = setValue(7);
    store.dispatch(action);

    expect(store.getActions()).toEqual([
      action,
      addUndoItem(action, { val: initialState.counter })
    ]);
  });
  it('dispatches BEGIN_GROUP AND END_GROUP for GROUP actions', () => {
    const store = mockStore(initialState);
    const action = increment();
    const action2 = decrement();
    const groupedAction = group(action, action2);
    store.dispatch(groupedAction);
    expect(store.getActions()).toEqual([
      groupedAction,
      beginGroup(),
      action,
      addUndoItem(action),
      action2,
      addUndoItem(action2),
      endGroup()
    ]);
  });

  describe('UNDO_HISTORY@UNDO', () => {
    it('dispatches the reverting action', () => {
      const store = mockStore(
        createStateWithOneUndoItem({
          action: increment(),
          args: undefined
        })
      );
      store.dispatch(undo());

      expect(store.getActions()).toEqual([undo(), decrement()]);
    });
  });

  describe('UNDO_HISTORY@REDO', () => {
    it('dispatches the original action', () => {
      const store = mockStore(
        createStateWithOnRedoItem({
          action: increment(),
          args: undefined
        })
      );
      store.dispatch(redo());

      expect(store.getActions()).toEqual([redo(), increment()]);
    });
  });
});
