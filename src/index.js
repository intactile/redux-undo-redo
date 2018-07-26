import createMiddleware from './createUndoMiddleware';
import createReducer from './createUndoReducer';
import { undo, redo, group, clearHistory } from './actions';
import { canUndo, canRedo } from './selectors';

export const actions = { undo, redo, group, clearHistory };
export const selectors = { canUndo, canRedo };
export const createUndoReducer = createReducer;
export const createUndoMiddleware = createMiddleware;
