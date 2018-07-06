import createMiddleware from './createUndoMiddleware';
import reducer, { undo, redo, group, clearHistory, canUndo, canRedo } from './undoReduxModule';

export const actions = { undo, redo, group, clearHistory };
export const selectors = { canUndo, canRedo };
export const undoReducer = reducer;
export const createUndoMiddleware = createMiddleware;
