import { omitBy, isNil } from "lodash";

// ------------------------------------
// Constants
// ------------------------------------
export const GROUP = "UNDO_HISTORY@GROUP";
export const UNDO = "UNDO_HISTORY@UNDO";
export const REDO = "UNDO_HISTORY@REDO";
// export const BEGIN_UNDO_GROUP = 'UNDO_HISTORY@BEGIN_UNDO_GROUP';
// export const END_UNDO_GROUP = 'UNDO_HISTORY@END_UNDO_GROUP';
const ADD_UNDO_ITEM = "UNDO_HISTORY@ADD";
const CLEAR_HISTORY = "UNDO_HISTORY@CLEAR";
const UNDO_GROUP = "UNDO_HISTORY@UNDO_GROUP";
const REDO_GROUP = "UNDO_HISTORY@REDO_GROUP";

// ------------------------------------
// Selectors
// ------------------------------------
export const getUndoItem = state => state.undoHistory.undoQueue[0];
export const getRedoItem = state => state.undoHistory.redoQueue[0];

function getGroupSize(state) {
  const { groups, cursor } = state.undoGroup;
  return groups[groups.length - cursor];
}

// ------------------------------------
// Actions
// ------------------------------------
export function undo() {
  return { type: UNDO };
}

export function redo() {
  return { type: REDO };
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

export function clear() {
  return {
    type: CLEAR_HISTORY
  };
}
export function group(action) {
  return {
    type: GROUP_UNDO,
    payload: action
  };
}

// ------------------------------------
// Reducer
// ------------------------------------

const initialState = {
  undoQueue: [],
  redoQueue: []
};

export default function undoHistoryReducer(state = initialState, action) {
  const { type, payload: undoItem } = action;
  const { undoQueue, redoQueue } = state;

  switch (type) {
    case "UNDO_HISTORY@UNDO": {
      return undoQueue.length === 0
        ? state
        : {
            undoQueue: undoQueue.slice(1),
            redoQueue: [undoQueue[0], ...redoQueue]
          };
    }
    case "UNDO_HISTORY@REDO": {
      return redoQueue.length === 0
        ? state
        : {
            undoQueue: [redoQueue[0], ...undoQueue],
            redoQueue: redoQueue.slice(1)
          };
    }
    case "UNDO_HISTORY@ADD": {
      return {
        undoQueue: [omitBy(undoItem, isNil), ...undoQueue],
        redoQueue: []
      };
    }
    case "UNDO_HISTORY@CLEAR":
      return initialState;
    default:
      return state;
  }
}
