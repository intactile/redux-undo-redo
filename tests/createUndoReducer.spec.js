import {
  addUndoItem,
  undo,
  redo,
  beginGroup,
  endGroup,
  clearHistory,
  rewriteHistory
} from '../src/actions';
import createUndoReducer from '../src/createUndoReducer';

describe('reducer', () => {
  const i0 = { action: { type: 'ACTION0' } };
  const i1 = { action: { type: 'ACTION1' } };
  const i2 = { action: { type: 'ACTION2' } };
  const i3 = { action: { type: 'ACTION3' } };
  const i4 = { action: { type: 'ACTION4' } };

  const undoHistoryReducer = createUndoReducer();
  describe('addUndoItem', () => {
    it('adds items to the undo queue in reverse order', () => {
      const initialState = {
        undoQueue: [],
        redoQueue: []
      };
      const undoableActions = [{ type: 'ACTION1' }, { type: 'ACTION2' }, { type: 'ACTION3' }];
      const expectedState = {
        undoQueue: [[i3], [i2], [i1]],
        redoQueue: []
      };

      const result = undoableActions.reduce(
        (state, action) => undoHistoryReducer(state, addUndoItem(action)),
        initialState
      );

      expect(result).toEqual(expectedState);
    });

    it('resets the redo queue', () => {
      const initialState = {
        undoQueue: [[i1]],
        redoQueue: [[i2], [i3]]
      };
      const action = { type: 'ACTION4' };
      const expectedState = {
        undoQueue: [[i4], [i1]],
        redoQueue: []
      };

      const result = undoHistoryReducer(initialState, addUndoItem(action));

      expect(result).toEqual(expectedState);
    });

    it('adds items to a new group if the group is not created', () => {
      const initialState = {
        undoQueue: [[i1]],
        redoQueue: [[i2], [i3]],
        groupLevel: 2,
        groupCreated: false
      };
      const action = { type: 'ACTION4' };
      const expectedState = {
        undoQueue: [[i4], [i1]],
        redoQueue: [],
        groupLevel: 2,
        groupCreated: true
      };

      const result = undoHistoryReducer(initialState, addUndoItem(action));

      expect(result).toEqual(expectedState);
    });

    it('adds items to the first group if the group is created', () => {
      const initialState = {
        undoQueue: [[i1]],
        redoQueue: [[i2], [i3]],
        groupLevel: 1,
        groupCreated: true
      };
      const action = { type: 'ACTION4' };
      const expectedState = {
        undoQueue: [[i4, i1]],
        redoQueue: [],
        groupLevel: 1,
        groupCreated: true
      };

      const result = undoHistoryReducer(initialState, addUndoItem(action));

      expect(result).toEqual(expectedState);
    });
  });

  describe('undo', () => {
    it('removes the first item in the undo queue', () => {
      const initialState = {
        undoQueue: [[i3], [i2], [i1]],
        redoQueue: []
      };
      const expectedState = {
        undoQueue: [[i2], [i1]],
        redoQueue: [[i3]]
      };

      const result = undoHistoryReducer(initialState, undo());

      expect(result).toEqual(expectedState);
    });

    it('adds the first item in the undo queue to the redo queue', () => {
      const initialState = {
        undoQueue: [[i2], [i1]],
        redoQueue: [[i3]]
      };
      const expectedState = {
        undoQueue: [[i1]],
        redoQueue: [[i2], [i3]]
      };

      const result = undoHistoryReducer(initialState, undo());

      expect(result).toEqual(expectedState);
    });

    it('doesnt change redo queue if undo queue is empty', () => {
      const initialState = {
        undoQueue: [],
        redoQueue: [i2, i3]
      };

      const result = undoHistoryReducer(initialState, undo());

      expect(result).toEqual(initialState);
    });
  });

  describe('redo', () => {
    it('removes the first item in the redo queue', () => {
      const initialState = {
        undoQueue: [],
        redoQueue: [[i1], [i3], [i2]]
      };
      const expectedState = {
        undoQueue: [[i1]],
        redoQueue: [[i3], [i2]]
      };

      const result = undoHistoryReducer(initialState, redo());

      expect(result).toEqual(expectedState);
    });

    it('adds the first item in the redo queue to the undo queue', () => {
      const initialState = {
        undoQueue: [[i1]],
        redoQueue: [[i3], [i2]]
      };
      const expectedState = {
        undoQueue: [[i3], [i1]],
        redoQueue: [[i2]]
      };

      const result = undoHistoryReducer(initialState, redo());

      expect(result).toEqual(expectedState);
    });

    it('doesnt change undo queue if redo queue is empty', () => {
      const initialState = {
        undoQueue: [[i2], [i3]],
        redoQueue: []
      };

      const result = undoHistoryReducer(initialState, redo());

      expect(result).toEqual(initialState);
    });
  });

  describe('beginGroup', () => {
    it('increment the group level and set groupCreated to false', () => {
      const initialState = {
        undoQueue: [[i3]],
        redoQueue: [[i1], [i2]],
        groupLevel: 0,
        groupCreated: false
      };
      const expectedState = {
        ...initialState,
        groupLevel: 1,
        groupCreated: false
      };

      const result = undoHistoryReducer(initialState, beginGroup());

      expect(result).toEqual(expectedState);
    });

    it('increment the group level if the level is > 0', () => {
      const initialState = {
        undoQueue: [[i3]],
        redoQueue: [[i1], [i2]],
        groupLevel: 3,
        groupCreated: true
      };
      const expectedState = {
        ...initialState,
        groupLevel: 4,
        groupCreated: true
      };

      const result = undoHistoryReducer(initialState, beginGroup());

      expect(result).toEqual(expectedState);
    });
  });

  describe('endGroup', () => {
    it('decrement the group level and set groupCreated to false il level === 1', () => {
      const initialState = {
        undoQueue: [[i3]],
        redoQueue: [[i1], [i2]],
        groupLevel: 1,
        groupCreated: true
      };
      const expectedState = {
        ...initialState,
        groupLevel: 0,
        groupCreated: false
      };

      const result = undoHistoryReducer(initialState, endGroup());

      expect(result).toEqual(expectedState);
    });

    it('decrement the group level and keep groupCreated to false', () => {
      const initialState = {
        undoQueue: [[i3]],
        redoQueue: [[i1], [i2]],
        groupLevel: 3,
        groupCreated: false
      };
      const expectedState = {
        ...initialState,
        groupLevel: 2,
        groupCreated: false
      };

      const result = undoHistoryReducer(initialState, endGroup());

      expect(result).toEqual(expectedState);
    });

    it('decrement the group level and keep groupCreated to true', () => {
      const initialState = {
        undoQueue: [[i3]],
        redoQueue: [[i1], [i2]],
        groupLevel: 3,
        groupCreated: true
      };
      const expectedState = {
        ...initialState,
        groupLevel: 2,
        groupCreated: true
      };

      const result = undoHistoryReducer(initialState, endGroup());

      expect(result).toEqual(expectedState);
    });
  });

  describe('rewriteHistory', () => {
    it('overwrite with the supplied state', () => {
      const initialState = {
        undoQueue: [[i3]],
        redoQueue: [[i1], [i2]],
        groupLevel: 0
      };
      const expectedState = {
        undoQueue: [[i0]],
        redoQueue: [[i1], [i2]],
        groupLevel: 1
      };

      const result = undoHistoryReducer(
        initialState,
        rewriteHistory({
          undoQueue: [[i0]],
          groupLevel: 1
        })
      );

      expect(result).toEqual(expectedState);
    });
  });

  describe('clearHistory', () => {
    it('reset to a blank state', () => {
      const initialState = {
        undoQueue: [[i1]],
        redoQueue: [[i1], [i2]]
      };
      const expectedState = {
        undoQueue: [],
        redoQueue: [],
        groupLevel: 0
      };

      const result = undoHistoryReducer(initialState, clearHistory());

      expect(result).toEqual(expectedState);
    });
  });
  describe('undo queue', () => {
    function checkUndoMaxHistoryLength(reducer, maxLength) {
      const initialState = {
        undoQueue: [],
        redoQueue: []
      };

      let state = initialState;
      for (let index = 1; index <= 100; index++) {
        const action = { type: `ACTION${index}` };
        state = reducer(state, addUndoItem(action));
      }
      expect(state.undoQueue[0]).toEqual([{ action: { type: 'ACTION100' }, args: undefined }]);
      expect(state.undoQueue).toHaveLength(maxLength);
    }

    it('is limited to 50 by default', () => {
      checkUndoMaxHistoryLength(undoHistoryReducer, 50);
    });

    it('could be limited to 10', () => {
      checkUndoMaxHistoryLength(createUndoReducer({ undoHistorySize: 10 }), 10);
    });
  });
  describe('redo queue', () => {
    function checkMaxRedoHistoryLength(reducer, maxLength) {
      const initialState = {
        undoQueue: [],
        redoQueue: []
      };

      let state = initialState;
      for (let index = 1; index <= 100; index++) {
        const action = { type: `ACTION${index}` };
        state = reducer(state, addUndoItem(action));
      }
      for (let index = 1; index <= 100; index++) {
        state = reducer(state, undo());
      }
      expect(state.redoQueue).toHaveLength(maxLength);
      expect(state.redoQueue[0]).toEqual([{ action: { type: 'ACTION1' }, args: undefined }]);
    }

    it('is limited to 10 by default', () => {
      checkMaxRedoHistoryLength(undoHistoryReducer, 10);
    });

    it('could be limited to 50', () => {
      checkMaxRedoHistoryLength(createUndoReducer({ redoHistorySize: 50 }), 50);
    });
  });
});
