import configureStore from 'redux-mock-store';
import createUndoMiddleware from '../src/createUndoMiddleware';
import { addUndoItem, undo, redo, group, beginGroup, endGroup } from '../src/undoReduxModule';
import { setValue, increment, decrement, revertingActions } from './counterReduxModule';

const initialState = {
  counter: 4
};

const notUndoableAction = () => ({ type: 'NOT_UNDOABLE' });
const undoMiddleware = createUndoMiddleware({
  revertingActions
});
const mockStore = configureStore([undoMiddleware]);

describe('undoMiddleware', () => {
  it('dispatches ADD for supported actions', () => {
    const store = mockStore(initialState);
    const action = increment();
    store.dispatch(action);

    expect(store.getActions()).toEqual([action, addUndoItem(action)]);
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
      const store = mockStore({
        counter: 4,
        undoHistory: {
          undoQueue: [
            [
              {
                action: increment(),
                args: undefined
              }
            ]
          ],
          redoQueue: []
        }
      });
      store.dispatch(undo());

      expect(store.getActions()).toEqual([undo(), decrement()]);
    });
  });

  describe('UNDO_HISTORY@REDO', () => {
    it('dispatches the original action', () => {
      const store = mockStore({
        counter: 4,
        undoHistory: {
          undoQueue: [],
          redoQueue: [
            [
              {
                action: increment(),
                args: undefined
              }
            ]
          ]
        }
      });
      store.dispatch(redo());

      expect(store.getActions()).toEqual([redo(), increment()]);
    });
  });
});
