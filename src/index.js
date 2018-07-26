import createMiddleware from './createUndoMiddleware';
import createReducer from './createUndoReducer';
import { undo, redo, group, clearHistory, rewriteHistory } from './actions';
import { canUndo, canRedo, getUndoQueue } from './selectors';

export const actions = { undo, redo, group, clearHistory, rewriteHistory };
export const selectors = { canUndo, canRedo, getUndoQueue };
export const createUndoReducer = createReducer;
export const createUndoMiddleware = createMiddleware;
