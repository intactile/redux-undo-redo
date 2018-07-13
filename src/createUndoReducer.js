import { createModuleReducer } from '@intactile/redux-utils';

import { UNDO, REDO, ADD_UNDO_ITEM, BEGIN_GROUP, END_GROUP, CLEAR_HISTORY } from './actions';

const initialState = {
  undoQueue: [],
  redoQueue: [],
  groupLevel: 0
};

const limitArraySize = (array, maxSize) =>
  array.length > maxSize ? array.splice(maxSize, array.length - maxSize) : array;

function createUndoReducer({ redoHistorySize = 10 }) {
  return function undoReducer(state) {
    const { undoQueue, redoQueue } = state;
    return undoQueue.length === 0
      ? state
      : {
          ...state,
          undoQueue: undoQueue.slice(1),
          redoQueue: limitArraySize([undoQueue[0], ...redoQueue], redoHistorySize)
        };
  };
}

function redoReducer(state) {
  const { undoQueue, redoQueue } = state;
  return redoQueue.length === 0
    ? state
    : {
        ...state,
        undoQueue: [redoQueue[0], ...undoQueue],
        redoQueue: redoQueue.slice(1)
      };
}

function createAddUndoItemReducer({ undoHistorySize = 50 }) {
  return function addUndoItemReducer(state, action) {
    const { undoQueue, groupLevel, groupCreated } = state;
    const { payload: undoItem } = action;
    let newUndoQueue = undoQueue;
    if (groupLevel > 0 && groupCreated) {
      const groupedAction = [undoItem, ...undoQueue[0]];
      newUndoQueue = [groupedAction, ...undoQueue.slice(1)];
    } else {
      newUndoQueue = [[undoItem], ...undoQueue];
    }
    newUndoQueue = limitArraySize(newUndoQueue, undoHistorySize);

    return {
      ...state,
      undoQueue: limitArraySize(newUndoQueue),
      groupCreated: groupLevel > 0 ? true : undefined,
      redoQueue: []
    };
  };
}

function beginGroupReducer(state) {
  return {
    ...state,
    groupLevel: state.groupLevel + 1,
    groupCreated: state.groupLevel > 0
  };
}

function endGroupReducer(state) {
  return {
    ...state,
    groupLevel: state.groupLevel - 1
  };
}

function clearHistoryReducer() {
  return initialState;
}

export default function createUndoHistoryReducer(conf = {}) {
  return createModuleReducer(
    {
      [UNDO]: createUndoReducer(conf),
      [REDO]: redoReducer,
      [ADD_UNDO_ITEM]: createAddUndoItemReducer(conf),
      [BEGIN_GROUP]: beginGroupReducer,
      [END_GROUP]: endGroupReducer,
      [CLEAR_HISTORY]: clearHistoryReducer
    },
    initialState
  );
}
