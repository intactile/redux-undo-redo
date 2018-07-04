// ------------------------------------
// Constants
// ------------------------------------
export const GROUP = "UNDO_HISTORY@GROUP";
export const UNDO = "UNDO_HISTORY@UNDO";
export const REDO = "UNDO_HISTORY@REDO";
export const BEGIN_GROUP = "UNDO_HISTORY@BEGIN_GROUP";
export const END_GROUP = "UNDO_HISTORY@END_GROUP";
const ADD_UNDO_ITEM = "UNDO_HISTORY@ADD";
const CLEAR_HISTORY = "UNDO_HISTORY@CLEAR";
const UNDO_GROUP = "UNDO_HISTORY@UNDO_GROUP";
const REDO_GROUP = "UNDO_HISTORY@REDO_GROUP";

// ------------------------------------
// Selectors
// ------------------------------------
export const getUndoItems = state => state.undoHistory.undoQueue[0];
export const getRedoItems = state => state.undoHistory.redoQueue[0];

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
export function group(action) {
  return {
    type: GROUP,
    payload: action
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

export default function undoHistoryReducer(state = initialState, action) {
  const { type, payload: undoItem } = action;
  const { undoQueue, redoQueue } = state;

  switch (type) {
    case UNDO: {
      return undoQueue.length === 0
        ? state
        : {
            ...state,
            undoQueue: undoQueue.slice(1),
            redoQueue: [undoQueue[0], ...redoQueue]
          };
    }
    case REDO: {
      return redoQueue.length === 0
        ? state
        : {
            ...state,
            undoQueue: [redoQueue[0], ...undoQueue],
            redoQueue: redoQueue.slice(1)
          };
    }
    case ADD_UNDO_ITEM: {
      const { groupLevel, groupCreated } = state;
      if (groupLevel > 0) {
        if (groupCreated) {
          const group = [undoItem, ...undoQueue[0]];
          return {
            ...state,
            undoQueue: [group, ...undoQueue.slice(1)],
            redoQueue: []
          };
        } else {
          return {
            ...state,
            undoQueue: [[undoItem], ...undoQueue],
            redoQueue: [],
            groupCreated: true
          };
        }
      }
      return {
        ...state,
        undoQueue: [[undoItem], ...undoQueue],
        redoQueue: []
      };
    }
    case BEGIN_GROUP: {
      return {
        ...state,
        groupLevel: state.groupLevel + 1,
        groupCreated: state.groupLevel > 0
      };
    }
    case END_GROUP: {
      return {
        ...state,
        groupLevel: state.groupLevel - 1
      };
    }
    case CLEAR_HISTORY:
      return initialState;
    default:
      return state;
  }
}
