// ------------------------------------
// TYPES
// ------------------------------------
export const GROUP = 'UNDO_HISTORY@GROUP';
export const UNDO = 'UNDO_HISTORY@UNDO';
export const REDO = 'UNDO_HISTORY@REDO';
export const BEGIN_GROUP = 'UNDO_HISTORY@BEGIN_GROUP';
export const END_GROUP = 'UNDO_HISTORY@END_GROUP';

export const ADD_UNDO_ITEM = 'UNDO_HISTORY@ADD';
export const CLEAR_HISTORY = 'UNDO_HISTORY@CLEAR';

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
