import createMiddleware from './createUndoMiddleware';
import createReducer from './createUndoReducer';
import { undo, redo, group, clearHistory, pause, resume } from './actions';
import { canUndo, canRedo } from './selectors';

export const actions = { undo, redo, group, clearHistory, pause, resume };
export const selectors = { canUndo, canRedo };
export const createUndoReducer = createReducer;
export const createUndoMiddleware = createMiddleware;
