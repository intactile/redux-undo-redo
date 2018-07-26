import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { createUndoReducer, createUndoMiddleware, actions, selectors } from '../src';
import counter, {
  increment,
  setValue,
  multiplyValue,
  revertingActions,
  addValue,
  removeValue
} from './counterReduxModule';

describe('redux-undo-redo package', () => {
  const { undo, redo, group, clearHistory, rewriteHistory } = actions;
  const { canUndo, canRedo, getUndoQueue } = selectors;
  let store;
  beforeEach(() => {
    const initialState = {};
    const undoMiddleware = createUndoMiddleware({ revertingActions });
    store = createStore(
      combineReducers({ counter, undoHistory: createUndoReducer() }),
      initialState,
      applyMiddleware(thunk, undoMiddleware)
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

  const repeatFewTimes = callback => {
    for (let index = 0; index < 5; index++) {
      callback();
    }
  };

  const repeat100Times = callback => {
    for (let index = 0; index < 100; index++) {
      callback();
    }
  };

  it('should undo properly', () => {
    store.dispatch(increment());
    store.dispatch(increment());
    checkCounter(2);

    undoThenCheckCounter(1);
    undoThenCheckCounter(0);
  });

  it('should redo properly', () => {
    store.dispatch(increment());
    store.dispatch(increment());
    store.dispatch(undo());
    store.dispatch(undo());
    checkCounter(0);

    redoThenCheckCounter(1);
    redoThenCheckCounter(2);
  });

  it('should support unnecessary undos', () => {
    store.dispatch(increment());

    undoThenCheckCounter(0);
    undoThenCheckCounter(0);
    redoThenCheckCounter(1);
  });

  it('should support unnecessary redos', () => {
    store.dispatch(increment());
    store.dispatch(undo());

    redoThenCheckCounter(1);
    redoThenCheckCounter(1);
    undoThenCheckCounter(0);
  });

  it('should let undo and redo group of actions', () => {
    store.dispatch(increment());
    store.dispatch(group(increment(), increment(), increment()));
    store.dispatch(increment());
    store.dispatch(group(increment(), increment()));
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

  it('should let undo and redo succesive group of actions', () => {
    store.dispatch(group(increment(), increment(), increment()));
    store.dispatch(group(increment(), increment()));
    checkCounter(5);

    undoThenCheckCounter(3);
    undoThenCheckCounter(0);
    redoThenCheckCounter(3);
    redoThenCheckCounter(5);
  });

  it('should let undo and redo nested group of actions', () => {
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

  it('should not redo if another action have been done', () => {
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

  it('should not redo if the history have been cleared', () => {
    store.dispatch(increment());
    store.dispatch(increment());
    checkCounter(2);
    store.dispatch(clearHistory());
    undoThenCheckCounter(2);
  });

  it('should undo/redo in the correct order', () => {
    store.dispatch(setValue(10));
    store.dispatch(setValue(5));
    store.dispatch(setValue(1));
    checkCounter(1);
    // console.log(JSON.stringify(store.getState().undoHistory, null, 2));

    repeatFewTimes(() => {
      undoThenCheckCounter(5);
      undoThenCheckCounter(10);
      undoThenCheckCounter(0);
      redoThenCheckCounter(10);
      redoThenCheckCounter(5);
      redoThenCheckCounter(1);
    });
  });

  it('should undo/redo groups in the correct order', () => {
    store.dispatch(group(setValue(3), multiplyValue(3)));
    checkCounter(9);
    store.dispatch(group(increment(), multiplyValue(2)));
    checkCounter(20);

    repeatFewTimes(() => {
      undoThenCheckCounter(9);
      undoThenCheckCounter(0);
      redoThenCheckCounter(9);
      redoThenCheckCounter(20);
    });
  });

  it('should tells if undo or redo are possible', () => {
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

  it('should limit redo and undo history', () => {
    repeat100Times(() => store.dispatch(increment()));
    checkCounter(100);
    repeat100Times(() => store.dispatch(undo()));
    checkCounter(50);
    repeat100Times(() => store.dispatch(redo()));
    checkCounter(60);
  });

  it('should undo/redo a sequence of action grouped with the previous', () => {
    store.dispatch(addValue(2));
    store.dispatch(addValue(3));
    store.dispatch(addValue(5));
    checkCounter(10);

    repeatFewTimes(() => {
      undoThenCheckCounter(0);
      redoThenCheckCounter(10);
    });
  });

  it('should undo/redo several sequences of action grouped with the previous', () => {
    store.dispatch(addValue(2));
    store.dispatch(addValue(3));
    store.dispatch(removeValue(1));
    store.dispatch(removeValue(2));
    store.dispatch(setValue(10));
    store.dispatch(addValue(5));
    store.dispatch(removeValue(4));
    store.dispatch(removeValue(3));

    checkCounter(8);

    repeatFewTimes(() => {
      undoThenCheckCounter(15); // undo (-3 - 4)
      undoThenCheckCounter(10); // undo (+5)
      undoThenCheckCounter(2); // undo (set 10)
      undoThenCheckCounter(5); // undo (-2 - 1)
      undoThenCheckCounter(0); // undo (+3 + 2)
      redoThenCheckCounter(5); // redo (+3 + 2)
      redoThenCheckCounter(2); // redo (-2 - 1)
      redoThenCheckCounter(10); // redo (set 10)
      redoThenCheckCounter(15); // redo (+5)
      redoThenCheckCounter(8); // redo (-3 - 4)
    });
  });

  it('should rewriteHistory', () => {
    store.dispatch(increment());
    store.dispatch(increment());
    store.dispatch(increment());
    checkCounter(3);

    store.dispatch((dispatch, getState) => {
      const state = getState();
      const undoQueue = getUndoQueue(state);
      store.dispatch(
        rewriteHistory({
          undoQueue: [[...undoQueue[0], ...undoQueue[1], ...undoQueue[2]]],
          redoQueue: [[...undoQueue[0]]]
        })
      );
    });

    repeatFewTimes(() => {
      redoThenCheckCounter(4);
      undoThenCheckCounter(3);
      undoThenCheckCounter(0);
      redoThenCheckCounter(3);
    });
  });
});
