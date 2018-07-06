// ------------------------------------
// Constants
// ------------------------------------
export const GROUP = 'UNDO_HISTORY@GROUP';
export const UNDO = 'UNDO_HISTORY@UNDO';
export const REDO = 'UNDO_HISTORY@REDO';
export const BEGIN_GROUP = 'UNDO_HISTORY@BEGIN_GROUP';
export const END_GROUP = 'UNDO_HISTORY@END_GROUP';
const ADD_UNDO_ITEM = 'UNDO_HISTORY@ADD';
const CLEAR_HISTORY = 'UNDO_HISTORY@CLEAR';

// ------------------------------------
// Selectors
// ------------------------------------
export const getUndoItems = state => state.undoHistory.undoQueue[0];
export const getRedoItems = state => state.undoHistory.redoQueue[0];
export const canUndo = state => state.undoHistory.undoQueue.length > 0;
export const canRedo = state => state.undoHistory.redoQueue.length > 0;

// ------------------------------------
// Actions
// ------------------------------------
export function undo() {
  return { type: UNDO };
}

export function redo() {
  return { type: REDO };
}

export function beginGroup() {
  return { type: BEGIN_GROUP };
}

export function endGroup() {
  return { type: END_GROUP };
}

export function addUndoItem(action, args) {
  return {
    type: ADD_UNDO_ITEM,
    payload: {
      action,
      args
    }
  };
}

export function clearHistory() {
  return {
    type: CLEAR_HISTORY
  };
}
export function group(...actions) {
  return {
    type: GROUP,
    payload: actions
  };
}

// ------------------------------------
// Reducer
// ------------------------------------

const initialState = {
  undoQueue: [],
  redoQueue: [],
  groupLevel: 0
};

function undoReducer(state) {
  const { undoQueue, redoQueue } = state;
  return undoQueue.length === 0
    ? state
    : {
        ...state,
        undoQueue: undoQueue.slice(1),
        redoQueue: [undoQueue[0], ...redoQueue]
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

function addUndoItemReducer(state, action) {
  const { undoQueue } = state;
  const { payload: undoItem } = action;
  const { groupLevel, groupCreated } = state;
  if (groupLevel > 0) {
    if (groupCreated) {
      const groupedAction = [undoItem, ...undoQueue[0]];
      return {
        ...state,
        undoQueue: [groupedAction, ...undoQueue.slice(1)],
        redoQueue: []
      };
    }
    return {
      ...state,
      undoQueue: [[undoItem], ...undoQueue],
      redoQueue: [],
      groupCreated: true
    };
  }
  return {
    ...state,
    undoQueue: [[undoItem], ...undoQueue],
    redoQueue: []
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

const caseReducers = {
  [UNDO]: undoReducer,
  [REDO]: redoReducer,
  [ADD_UNDO_ITEM]: addUndoItemReducer,
  [BEGIN_GROUP]: beginGroupReducer,
  [END_GROUP]: endGroupReducer,
  [CLEAR_HISTORY]: clearHistoryReducer
};

export default function undoHistoryReducer(state = initialState, action) {
  const reducer = caseReducers[action.type];
  if (reducer) {
    return reducer(state, action);
  }
  return state;
}
