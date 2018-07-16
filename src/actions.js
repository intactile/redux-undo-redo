import { createActionCreator } from '@intactile/redux-utils';

// ------------------------------------
// TYPES
// ------------------------------------
export const GROUP = 'UNDO_HISTORY@GROUP';
export const UNDO = 'UNDO_HISTORY@UNDO';
export const REDO = 'UNDO_HISTORY@REDO';
export const BEGIN_GROUP = 'UNDO_HISTORY@BEGIN_GROUP';
export const END_GROUP = 'UNDO_HISTORY@END_GROUP';
export const PAUSE = 'UNDO_HISTORY@PAUSE';
export const RESUME = 'UNDO_HISTORY@RESUME';

export const ADD_UNDO_ITEM = 'UNDO_HISTORY@ADD';
export const CLEAR_HISTORY = 'UNDO_HISTORY@CLEAR';

// ------------------------------------
// Actions
// ------------------------------------
export const undo = createActionCreator(UNDO);
export const redo = createActionCreator(REDO);

export const beginGroup = createActionCreator(BEGIN_GROUP);
export const endGroup = createActionCreator(END_GROUP);
export const clearHistory = createActionCreator(CLEAR_HISTORY);

export const pause = createActionCreator(PAUSE);
export const resume = createActionCreator(RESUME);

export function addUndoItem(action, args, isGroupedWithPrevious) {
  return {
    type: ADD_UNDO_ITEM,
    payload: {
      action,
      args,
      isGroupedWithPrevious
    }
  };
}

export function group(...actions) {
  return {
    type: GROUP,
    payload: actions
  };
}
