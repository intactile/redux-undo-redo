import createMiddleware from "./createUndoMiddleware";
import reducer, { undo, redo, group, clearHistory } from "./undoReduxModule";
export const actions = { undo, redo, group, clearHistory };
export const undoReducer = reducer;
export const createUndoMiddleware = createMiddleware;
